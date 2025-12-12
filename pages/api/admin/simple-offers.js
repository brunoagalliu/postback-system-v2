// File: pages/api/admin/simple-offers.js
import { 
  createSimpleOffer, 
  updateSimpleOffer, 
  deleteSimpleOffer, 
  getAllSimpleOffers,
  logConversion
} from '../../../lib/database.js';
import { requireAdmin } from '../../../lib/adminAuth.js';

export default requireAdmin(async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all offers
        const offers = await getAllSimpleOffers();
        return res.status(200).json({
          success: true,
          offers
        });

      case 'POST':
        // Create new offer
        const { 
          offer_id, 
          offer_name,
          mode,
          trigger_amount,
          low_event_type,
          high_event_type
        } = req.body;
        
        if (!offer_id) {
          return res.status(400).json({
            success: false,
            message: 'Offer ID is required'
          });
        }

        // Validate offer_id format
        const offerIdRegex = /^[a-zA-Z0-9_-]{1,50}$/;
        if (!offerIdRegex.test(offer_id)) {
          return res.status(400).json({
            success: false,
            message: 'Offer ID must be 1-50 alphanumeric characters, hyphens, or underscores'
          });
        }

        // Validate advanced mode fields
        if (mode === 'advanced') {
          if (!trigger_amount || trigger_amount <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Trigger amount is required for advanced mode and must be greater than 0'
            });
          }
          if (!low_event_type) {
            return res.status(400).json({
              success: false,
              message: 'Low event type is required for advanced mode'
            });
          }
        }

        try {
          await createSimpleOffer(
            offer_id, 
            offer_name || '', 
            mode || 'simple',
            mode === 'advanced' ? parseFloat(trigger_amount) : null,
            mode === 'advanced' ? low_event_type : null,
            mode === 'advanced' ? (high_event_type || null) : null
          );
          
          // Log the offer creation
          await logConversion({
            clickid: 'admin',
            offer_id: offer_id,
            action: 'offer_created',
            message: `Admin created offer: ${offer_name || offer_id} (${offer_id}) - Mode: ${mode || 'simple'}${mode === 'advanced' ? `, Trigger: $${trigger_amount}, Low Event: ${low_event_type}, High Event: ''` : ''}`
          });

          return res.status(200).json({
            success: true,
            message: `Offer "${offer_id}" created successfully in ${mode || 'simple'} mode`
          });
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
              success: false,
              message: 'Offer ID already exists'
            });
          }
          throw error;
        }

      case 'PUT':
        // Update existing offer
        const { 
          offer_id: updateOfferId, 
          offer_name: updateOfferName,
          mode: updateMode,
          trigger_amount: updateTriggerAmount,
          low_event_type: updateLowEventType,
          high_event_type: updateHighEventType
        } = req.body;
        
        if (!updateOfferId) {
          return res.status(400).json({
            success: false,
            message: 'Offer ID is required'
          });
        }

        // Validate advanced mode fields
        if (updateMode === 'advanced') {
          if (!updateTriggerAmount || updateTriggerAmount <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Trigger amount is required for advanced mode and must be greater than 0'
            });
          }
          if (!updateLowEventType) {
            return res.status(400).json({
              success: false,
              message: 'Low event type is required for advanced mode'
            });
          }
        }

        const affectedRows = await updateSimpleOffer(
          updateOfferId, 
          updateOfferName || '', 
          updateMode || 'simple',
          updateMode === 'advanced' ? parseFloat(updateTriggerAmount) : null,
          updateMode === 'advanced' ? updateLowEventType : null,
          updateMode === 'advanced' ? (updateHighEventType || null) : null
        );

        if (affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Offer not found'
          });
        }

        // Log the offer update
        await logConversion({
          clickid: 'admin',
          offer_id: updateOfferId,
          action: 'offer_updated',
          message: `Admin updated offer: ${updateOfferName || updateOfferId} (${updateOfferId}) - Mode: ${updateMode || 'simple'}${updateMode === 'advanced' ? `, Trigger: $${updateTriggerAmount}, Low Event: ${updateLowEventType}, High Event: ''` : ''}`
        });

        return res.status(200).json({
          success: true,
          message: `Offer "${updateOfferId}" updated successfully`
        });

      case 'DELETE':
        // Delete offer
        const { offer_id: deleteOfferId } = req.query;
        
        if (!deleteOfferId) {
          return res.status(400).json({
            success: false,
            message: 'Offer ID is required'
          });
        }

        const deletedRows = await deleteSimpleOffer(deleteOfferId);

        if (deletedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Offer not found'
          });
        }

        // Log the offer deletion
        await logConversion({
          clickid: 'admin',
          offer_id: deleteOfferId,
          action: 'offer_deleted',
          message: `Admin deleted offer: ${deleteOfferId}`
        });

        return res.status(200).json({
          success: true,
          message: `Offer ${deleteOfferId} deleted successfully`
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }

  } catch (error) {
    console.error('Simple offer management error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to manage offers'
    });
  }
});