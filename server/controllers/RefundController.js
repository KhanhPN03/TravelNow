const Refund = require('../models/Refund');

class RefundController {
  // [POST] /refund/create
  async createRefundRequest(req, res, next) {
    try {
      const { userId, ticketId, refundInformation } = req.body;   
      
      // Kiểm tra dữ liệu đầu vào
      if (!userId || !ticketId || !refundInformation) {
        return res.status(400).json({
          status: "error",
          message: "userId, ticketId, and refundInformation are required",
        });
      }

      // Kiểm tra refundInformation có đầy đủ các trường không
      const { accountNumber, bankName, accountNameBank, reason } = refundInformation;
      if (!accountNumber || !bankName || !accountNameBank || !reason) {
        return res.status(400).json({
          status: "error",
          message: "accountNumber, bankName, reason and accountNameBank are required in refundInformation",
        });
      }

      // Tạo refund request mới
      const newRefund = new Refund({
        userId,
        ticketId,
        refundInformation: {
          accountNumber,
          bankName,
          accountNameBank,
          reason
        },      
        // refundStatus mặc định là "PENDING" theo schema
        // refundBy mặc định là null theo schema
      });

      // Lưu vào database
      const savedRefund = await newRefund.save();

      res.status(201).json({
        status: "success",
        message: "Refund request created successfully",
        refund: savedRefund,
      });
    } catch (error) {
      console.error("Error creating refund request:", error); 
      next(error); // Chuyển lỗi cho middleware xử lý
    }
  }

  async getRefundRequests(req, res, next) {
    try {
      // Lấy tất cả refund requests từ database
      const refundRequests = await Refund.find()
        .populate('userId') // Lấy thông tin từ collection Account
        .populate('refundBy') // Lấy thông tin người xử lý refund (nếu có)
        .populate('ticketId') // Lấy thông tin từ collection Ticket
        .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần

      // Kiểm tra nếu không có refund request nào
      if (!refundRequests || refundRequests.length === 0) {
        return res.status(404).json({
          status: "success",
          message: "No refund requests found",
          data: []
        });
      }

      // Trả về danh sách refund requests
      res.status(200).json({
        status: "success",
        message: "Refund requests retrieved successfully",
        total: refundRequests.length,
        refundRequests
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRefundRequest(req, res, next) {
    try {
      const { id } = req.params; // Lấy ID từ URL
      // Tìm và cập nhật refund request
      const updatedRefund = await Refund.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true } // Trả về document sau khi cập nhật
      );
  
      // Kiểm tra nếu không tìm thấy refund request
      if (!updatedRefund) {
        return res.status(404).json({
          status: "error",
          message: "Refund request not found",
        });
      }
  
      res.status(200).json({
        status: "success",
        message: "Refund request updated successfully",
        refund: updatedRefund,
      });
    } catch (error) {
      console.error("Error updating refund request:", error);
      next(error);
    }
  }
    
}

module.exports = new RefundController();