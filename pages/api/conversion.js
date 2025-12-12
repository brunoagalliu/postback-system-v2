// File: pages/api/conversion.js - COMPLETE FILE with Advanced Mode
import {
  initializeDatabase,
  addCachedConversion,
  getCachedTotalByVertical,
  getVerticalPayoutThreshold,
  getOfferVertical,
  logConversion,
  logPostback,
  getOfferWithMode,
  clearCacheByVertical,
  getOffersInSameVertical
} from '../../lib/database.js';

// Function to validate RedTrack clickid format
function isValidClickid(clickid) {
  if (!clickid || typeof clickid !== 'string') {
    return false;
  }
  
  const clickidRegex = /^[0-9a-zA-Z]{24}$/;
  return clickidRegex.test(clickid);
}

// Function to validate offer ID
function isValidOfferId(offer_id) {
  if (!offer_id || typeof offer_id !== 'string') {
    return false;
  }
  
  const offerIdRegex = /^[a-zA-Z0-9_-]{1,50}$/;
  return offerIdRegex.test(offer_id);
}

export default async function handler(req, res) {
  try {
    await initializeDatabase();
    
    const { clickid, sum, offer_id, param1 } = req.query;
    const sumValue = parseFloat(sum || 0);
    const param1Value = parseFloat(param1 || 0);
    
    await logConversion({
      clickid,
      offer_id,
      original_amount: sumValue,
      original_param1: param1Value,
      action: 'request_received',
      message: `Request received: clickid=${clickid}, offer_id=${offer_id}, sum=${sum}, param1=${param1}`
    });
    
    // Validate clickid format
    if (!isValidClickid(clickid)) {
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        action: 'invalid_clickid',
        message: `Invalid clickid format rejected: '${clickid}' (must be 24 alphanumeric characters)`
      });
      return res.status(200).send("0");
    }
    
    // Validate offer_id
    if (!isValidOfferId(offer_id)) {
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        action: 'invalid_offer_id',
        message: `Invalid offer_id format rejected: '${offer_id}' (must be 1-50 alphanumeric characters, hyphens, or underscores)`
      });
      return res.status(200).send("0");
    }
    
    // Validate sum value
    if (sumValue <= 0) {
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        action: 'validation_failed',
        message: `Invalid sum value rejected: clickid=${clickid}, offer_id=${offer_id}, sum=${sum}`
      });
      return res.status(200).send("0");
    }

    // Validate param1 value
    if (param1Value <= 0) {
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        action: 'validation_failed',
        message: `Invalid param1 value rejected: clickid=${clickid}, offer_id=${offer_id}, param1=${param1}`
      });
      return res.status(200).send("0");
    }

    // Check if offer exists in our system (now with mode info)
    const offerExists = await getOfferWithMode(offer_id);
    
    if (!offerExists) {
      // UNKNOWN OFFER: Fire postback directly without caching
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        action: 'unknown_offer_direct_fire',
        message: `Unknown offer ${offer_id} - firing postback directly without caching. Amount: $${sumValue.toFixed(2)}, param1: ${param1Value}`
      });

      const redtrackUrl = `https://clks.trackthisclicks.com/postback?clickid=${encodeURIComponent(clickid)}&sum=${encodeURIComponent(sumValue)}&offer_id=${encodeURIComponent(offer_id)}&sub1=${encodeURIComponent(param1Value)}`;
      
      let postbackSuccess = false;
      let responseText = '';
      let errorMessage = null;
      
      try {
        const response = await fetch(redtrackUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        responseText = await response.text();
        postbackSuccess = true;
        
        await logConversion({
          clickid,
          offer_id,
          original_amount: sumValue,
          original_param1: param1Value,
          total_sent: sumValue,
          trigger_param1: param1Value,
          action: 'unknown_offer_postback_success',
          message: `Direct postback successful for unknown offer ${offer_id}. Amount: $${sumValue.toFixed(2)}, param1: ${param1Value}, Response: ${responseText}`
        });
        
      } catch (error) {
        errorMessage = error.message;
        
        await logConversion({
          clickid,
          offer_id,
          original_amount: sumValue,
          original_param1: param1Value,
          total_sent: sumValue,
          trigger_param1: param1Value,
          action: 'unknown_offer_postback_failed',
          message: `Direct postback failed for unknown offer ${offer_id}. Amount: $${sumValue.toFixed(2)}, param1: ${param1Value}, Error: ${error.message}`
        });
      }
      
      await logPostback(clickid, offer_id, sumValue, param1Value, redtrackUrl, postbackSuccess, responseText, errorMessage);
      
      if (postbackSuccess) {
        return res.status(200).send("2");
      } else {
        return res.status(200).send("3");
      }
    }

    // ====================
    // ADVANCED MODE CHECK
    // ====================
    if (offerExists.mode === 'advanced') {
      // ADVANCED MODE: Fire every conversion immediately with event type
      
      const triggerAmount = offerExists.trigger_amount || 50;
      const isLowConversion = param1Value < triggerAmount;
      
      // Determine event type
      let eventType = '';
      if (isLowConversion) {
        eventType = offerExists.low_event_type || 'CompleteRegistration';
      } else {
        eventType = '';
      }
      
      // Build postback URL with event type
      const redtrackUrl = `https://clks.trackthisclicks.com/postback?clickid=${encodeURIComponent(clickid)}&sum=${encodeURIComponent(sumValue)}&offer_id=${encodeURIComponent(offer_id)}&sub1=${encodeURIComponent(param1Value)}&type=${encodeURIComponent(eventType)}`;
      
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        total_sent: sumValue,
        trigger_param1: param1Value,
        action: 'advanced_mode_direct_fire',
        message: `Advanced mode: Firing ${isLowConversion ? 'LOW' : 'HIGH'} conversion directly. param1=${param1Value}, trigger=${triggerAmount}, event=${eventType}, sum=$${sumValue.toFixed(2)}`
      });
      
      // Fire the postback
      let postbackSuccess = false;
      let responseText = '';
      let errorMessage = null;
      
      try {
        const response = await fetch(redtrackUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        responseText = await response.text();
        postbackSuccess = true;
        
        await logConversion({
          clickid,
          offer_id,
          original_amount: sumValue,
          original_param1: param1Value,
          total_sent: sumValue,
          trigger_param1: param1Value,
          action: 'advanced_mode_postback_success',
          message: `Advanced mode postback successful. Event: ${eventType}, Amount: $${sumValue.toFixed(2)}, param1: ${param1Value}, Response: ${responseText}`
        });
        
      } catch (error) {
        errorMessage = error.message;
        
        await logConversion({
          clickid,
          offer_id,
          original_amount: sumValue,
          original_param1: param1Value,
          total_sent: sumValue,
          trigger_param1: param1Value,
          action: 'advanced_mode_postback_failed',
          message: `Advanced mode postback failed. Event: ${eventType}, Amount: $${sumValue.toFixed(2)}, param1: ${param1Value}, Error: ${error.message}`
        });
      }
      
      // Log the postback attempt
      await logPostback(clickid, offer_id, sumValue, param1Value, redtrackUrl, postbackSuccess, responseText, errorMessage);
      
      if (postbackSuccess) {
        return res.status(200).send("2");
      } else {
        return res.status(200).send("3");
      }
    }

    // ====================
    // SIMPLE MODE (EXISTING CACHING LOGIC)
    // ====================
    
    // Get payout threshold for this offer's vertical (defaults to 10.00 if no vertical assigned)
    const payoutThreshold = await getVerticalPayoutThreshold(offer_id);
    
    // Get vertical info for logging
    const verticalInfo = await getOfferVertical(offer_id);
    const verticalName = verticalInfo ? verticalInfo.name : 'Unassigned';
    
    // Get cached sum total for ALL offers in the same vertical
    const verticalCachedSum = await getCachedTotalByVertical(offer_id);
    
    await logConversion({
      clickid,
      offer_id,
      original_amount: sumValue,
      original_param1: param1Value,
      cached_amount: verticalCachedSum,
      action: 'simple_mode_cache_loaded',
      message: `Simple mode offer: ${offerExists.offer_name || offer_id}. Vertical "${verticalName}" cached sum: $${verticalCachedSum.toFixed(2)}, New sum: $${sumValue.toFixed(2)}, New param1: ${param1Value}, Threshold: ${payoutThreshold.toFixed(2)}`
    });
    
    // KEY CHANGE: Check CURRENT param1 against threshold (not sum, not cumulative param1)
    if (param1Value < payoutThreshold) {
      // Cache both sum and param1
      await addCachedConversion(clickid, offer_id, sumValue, param1Value);
      const newVerticalCachedSum = await getCachedTotalByVertical(offer_id);
      
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        cached_amount: newVerticalCachedSum,
        action: 'cached_conversion',
        message: `Cached conversion (param1 ${param1Value} < threshold ${payoutThreshold.toFixed(2)}). Cached sum: $${sumValue.toFixed(2)}, param1: ${param1Value}. New vertical "${verticalName}" cached sum total: $${newVerticalCachedSum.toFixed(2)}`
      });
      
      return res.status(200).send("1");
    }
    
    // THRESHOLD REACHED: param1 >= payoutThreshold
    // Fire postback with:
    // - sum = current sum + all cached sums
    // - sub1 = current param1 (the triggering value)
    
    const totalSumToSend = sumValue + verticalCachedSum;
    const triggerParam1 = param1Value;
    
    const redtrackUrl = `https://clks.trackthisclicks.com/postback?clickid=${encodeURIComponent(clickid)}&sum=${encodeURIComponent(totalSumToSend)}&offer_id=${encodeURIComponent(offer_id)}&sub1=${encodeURIComponent(triggerParam1)}`;
    
    // Get list of all offers in the same vertical for logging
    const offersInVertical = await getOffersInSameVertical(offer_id);
    
    await logConversion({
      clickid,
      offer_id,
      original_amount: sumValue,
      original_param1: param1Value,
      cached_amount: verticalCachedSum,
      total_sent: totalSumToSend,
      trigger_param1: triggerParam1,
      action: 'preparing_postback',
      message: `Preparing postback for offer ${offer_id} (${offerExists.offer_name || 'No name'}) in vertical "${verticalName}". Trigger: param1=${triggerParam1} >= threshold ${payoutThreshold.toFixed(2)}. Sending sum=$${totalSumToSend.toFixed(2)} (current $${sumValue.toFixed(2)} + cached $${verticalCachedSum.toFixed(2)}), sub1=${triggerParam1}. Offers in vertical: ${offersInVertical.offers.join(', ')}`
    });
    
    // Clear cache before firing postback
    if (verticalCachedSum > 0) {
      const clearedRows = await clearCacheByVertical(offer_id);
      
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        cached_amount: verticalCachedSum,
        total_sent: totalSumToSend,
        trigger_param1: triggerParam1,
        action: 'vertical_cache_cleared',
        message: `Vertical "${verticalName}" cache cleared before postback. Removed ${clearedRows} cached entries from ALL offers in vertical (${offersInVertical.offers.join(', ')}). Total sum sent: $${totalSumToSend.toFixed(2)}, trigger param1: ${triggerParam1}`
      });
    }
    
    // Fire the postback
    let postbackSuccess = false;
    let responseText = '';
    let errorMessage = null;
    
    try {
      const response = await fetch(redtrackUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      responseText = await response.text();
      postbackSuccess = true;
      
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        cached_amount: verticalCachedSum,
        total_sent: totalSumToSend,
        trigger_param1: triggerParam1,
        action: 'postback_success',
        message: `Postback successful for offer ${offer_id} (${offerExists.offer_name || 'No name'}) in vertical "${verticalName}". Sum sent: $${totalSumToSend.toFixed(2)}, sub1: ${triggerParam1}. Response: ${responseText}`
      });
      
    } catch (error) {
      errorMessage = error.message;
      
      await logConversion({
        clickid,
        offer_id,
        original_amount: sumValue,
        original_param1: param1Value,
        cached_amount: verticalCachedSum,
        total_sent: totalSumToSend,
        trigger_param1: triggerParam1,
        action: 'postback_failed',
        message: `Error sending postback for offer ${offer_id} (${offerExists.offer_name || 'No name'}) in vertical "${verticalName}": ${error.message}`
      });
    }
    
    // Log the postback attempt
    await logPostback(clickid, offer_id, totalSumToSend, triggerParam1, redtrackUrl, postbackSuccess, responseText, errorMessage);
    
    if (postbackSuccess) {
      return res.status(200).send("2");
    } else {
      return res.status(200).send("3");
    }
    
  } catch (error) {
    console.error('Database error:', error);
    
    try {
      await logConversion({
        clickid: req.query.clickid,
        offer_id: req.query.offer_id,
        action: 'system_error',
        message: `System error: ${error.message}`
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return res.status(200).send("4");
  }
}