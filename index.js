const express = require('express');
const { admin, db ,bucket} = require('./fbase.js');
const utils = require('./utils.js');
const { v4: uuidv4 } = require('uuid');
const { VNPay, ignoreLogger,ProductCode, VnpLocale, dateFormat,IpnFailChecksum,
  IpnOrderNotFound,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnUnknownError,
  IpnSuccess,  } = require('vnpay');
const app = express();const multer = require('multer');
require('dotenv').config();


const vnpay = new VNPay({
  tmnCode: 'BFWLAW9Z',
  secureSecret: 'EZ8S2XSRMSXKQ2BLYO80Y208GPWCRD8M',
  vnpayHost: 'https://sandbox.vnpayment.vn',
});

var bodyParser = require('body-parser');

const upload = multer({ storage: multer.memoryStorage() }); 
app.use(bodyParser.urlencoded({extended: true}));
app.post('/uploader',upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    try {
      // Create a reference to the Firebase Storage location
      const file = bucket.file(Date.now() + '-' + req.file.originalname);
      const uuid = uuidv4(); 
      // Create a write stream to upload the file
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: uuid
          }
        }
      });
     

      // Pipe the file buffer to the write stream
      stream.end(req.file.buffer);

      // Wait for the upload to complete
      stream.on('finish', async () => {
        // Generate a public URL for the uploaded file
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.name}?alt=media&token=${uuid}`;        
        res.status(200).send({ imageUrl: publicUrl });
      });

      // Handle errors during the upload
      stream.on('error', (err) => {
        console.error('Upload failed:', err);
        res.status(500).send('Upload failed.');
      });
    } catch (error) {
      console.error('Error during upload:', error);
      res.status(500).send('Error during upload.');
    }
  });
  app.use(bodyParser.json());



  app.post('/createStaff', async (req, res) => {
    try {    
      const {username, password } = req.body;
      const collection = db.collection('user');
      console.log(`${username}  ${password} `);
      await collection.add({
        "username":username, 
        "password":password, 
        "rule": 2
      });
      
      res.status(200).send({"staus":"success"});
    } catch (error) {
      res.status(500).send({"status":"fail"});
    }
  });
app.post('/register', async (req, res) => {
    try {    
      const {username, password } = req.body;
      const collection = db.collection('user');
      console.log(`${username}  ${password} `);
      await collection.add({
        "username":username, 
        "password":password, 
        "rule": 1
      });
      
      res.status(200).send({"staus":"success"});
    } catch (error) {
      res.status(500).send({"status":"fail"
        
      });
    }
  });
  app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const collection = db.collection('user');
  
      // Tìm người dùng theo username và password
      const snapshot = await collection
        .where('username', '==', username)
        .where('password', '==', password)
        .get();
  
      if (snapshot.empty) {
        return res.status(401).send({"status":'fail'});
      }
  
      // Lấy thông tin người dùng đầu tiên (nếu có)
      const user = snapshot.docs[0].data();  
      res.status(200).send({
        "status": "success",
        "user": {
          "username": user.username,
          "rule": user.rule
        }
      });
    } catch (error) {
      res.status(500).send('Lỗi: ' + error.message);
    }
  });
  //admin
  //thêm bàn
  app.post('/add-table', async (req, res) => {
    try {
      const { tableNumber, seatCount, location, status } = req.body;
      const collection = db.collection('tables');
  
      await collection.add({
        tableNumber,
        seatCount,
        location,
        status: status || 'available', // mặc định là 'available'
        createdAt: new Date()
      });
  
      res.status(200).send({ status: 'success' });
    } catch (error) {
      console.error('Add table error:', error);
      res.status(500).send({ status: 'fail' });
    }
  });
  //danh sách bàn
  app.get('/tables', async (req, res) => {
    try {
      const snapshot = await db.collection('tables').orderBy('tableNumber').get();
  
      const tables = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      res.status(200).send({
        status: 'success',
        data: tables
      });
    } catch (error) {
      console.error('Get tables error:', error);
      res.status(500).send({ status: 'fail' });
    }
  });
//xóa bàn
  app.delete('/tables/:id', async (req, res) => {
    const tableId = req.params.id;
  
    try {
      const tableRef = db.collection('tables').doc(tableId);
      const doc = await tableRef.get();
  
      if (!doc.exists) {
        return res.status(404).send({ status: 'fail', message: 'Table not found' });
      }
  
      await tableRef.delete();
      res.status(200).send({ status: 'success', message: 'Table deleted successfully' });
    } catch (error) {
      console.error('Delete table error:', error);
      res.status(500).send({ status: 'fail', message: error.message });
    }
  });
  
  
  //thêm món ăn
  app.post('/add_menu_item', async (req, res) => {
    try {
      const { name, price, category, description, images } = req.body;
      const collection = db.collection('menu');
  
      await collection.add({
        name: name,
        price: price,
        category: category,
        description: description || '',
        image: images || [],
        createdAt: new Date()
      });
  
      res.status(200).send({ status: "success" });
    } catch (error) {
      console.error("Error adding menu item:", error);
      res.status(500).send({ status: "fail" });
    }
  });
  
  //user
  //đặt bàn
  app.post('/customer/preorder', async (req, res) => {
    try {
      const {
        customerName,
        phoneNumber,
        numberOfGuests,
        arrivalTime
      } = req.body;
  
      const collection = db.collection('preorders');
  
      await collection.add({
        customerName,
        phoneNumber,
        numberOfGuests,
        arrivalTime: new Date(arrivalTime),
        createdAt: new Date(),
        status: 'pending' // hoặc 'confirmed', 'canceled' nếu bạn có xử lý sau
      });
  
      res.status(200).send({ status: 'success' });
    } catch (error) {
      console.error("Preorder error:", error);
      res.status(500).send({ status: 'fail' });
    }
  });
  //lấy menu
  app.get('/menu', async (req, res) => {
    try {
      const snapshot = await db.collection('menu').orderBy('name').get();
  
      const menuItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      res.status(200).send({
        status: 'success',
        data: menuItems
      });
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).send({ status: 'fail', message: error.message });
    }
  });
  
//order 
app.post('/order', async (req, res) => {
  try {
    const { tableNumber, items } = req.body;

    if (!tableNumber ||  !items || items.length === 0) {
      return res.status(400).send({ status: 'fail', message: 'Missing table number, user ID, phone number, or menu items' });
    }

    // Tính tổng tiền của các món ăn
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.count, 0);

    // Lưu đơn hàng vào Firestore
    const orderRef = await db.collection('orders').add({
      tableNumber,      
      items,
      totalAmount,
      status: 'pending',
      createdAt: dateFormat(new Date())
    });

    res.status(200).send({
      status: 'success',
      message: 'Order placed successfully',
      orderId: orderRef.id
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).send({ status: 'fail', message: 'An error occurred while placing the order' });
  }
});
app.post('/order/update', async (req, res) => {
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        status: 'fail',
        message: 'Missing or invalid orderId or items'
      });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).send({
        status: 'fail',
        message: 'Order not found'
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.count, 0);

    await orderRef.update({
      items,
      totalAmount,
      updatedAt: dateFormat(new Date())
    });

    res.status(200).send({
      status: 'success',
      message: 'Order updated successfully',
      orderId
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).send({
      status: 'fail',
      message: 'An error occurred while updating the order'
    });
  }
});
app.post('/order/status', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).send({
        status: 'fail',
        message: 'Missing orderId or status'
      });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).send({
        status: 'fail',
        message: 'Order not found'
      });
    }

    await orderRef.update({
      status,
      updatedAt: new Date()
    });

    res.status(200).send({
      status: 'success',
      message: 'Order status updated',
      orderId,
      newStatus: status
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).send({
      status: 'fail',
      message: 'An error occurred while updating the order status'
    });
  }
});

app.get('/payout',async (req, res) => {
  try {
    console.log(req.query);
      const status = req.query['vnp_TransactionStatus'];
      if(status==='00') res.status(200).send({'status':'success','message':'Giao dịch hoàn tất'});
      if(status=='01')res.status(300).send({'status':'fail','message':'Giao dịch chưa hoàn tất'});      
      if(status=='02')res.status(300).send({'status':'fail','message':'Giao dịch bị lỗi'});
      if(status=='04')res.status(300).send({'status':'fail','message':'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)'});
      if(status=='05')res.status(300).send({'status':'fail','message':'VNPAY đang xử lý giao dịch này (GD hoàn tiền)'});
      if(status=='06')res.status(300).send({'status':'fail','message':'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)'});
      if(status=='07')res.status(300).send({'status':'fail','message':'Giao dịch bị nghi ngờ gian lận'});
      if(status=='09')res.status(300).send({'status':'fail','message':'GD Hoàn trả bị từ chối'});      
  } catch (error) {      
      console.log(`verify error: ${error}`);
      res.status(300).send({'status':'fail','message':'Giao dịch chưa hoàn tất'});      
  }
});
app.post('/pay',  async (req,res)=> {
  const {orderId,amount,description}= req.body;
  const tomorrow = new Date();
  const ref = uuidv4();
const date = dateFormat(new Date());

tomorrow.setDate(tomorrow.getDate() + 1);
const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr:req.ip === '::1' ? '13.160.92.202' : req.ip,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: description,
    vnp_OrderType: ProductCode.Other,
    vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
    vnp_CreateDate: date, // tùy chọn, mặc định là thời gian hiện tại
    vnp_ExpireDate: dateFormat(tomorrow),     
    vnp_ReturnUrl:'https://kichi.onrender.com/payout'    
});
    console.log(paymentUrl);
  res.status(200).send({
    'paymentUrl':paymentUrl, 
    // vnp_RequestId: generateRandomString(16),
    vnp_IpAddr: req.ip === '::1' ? '13.160.92.202' : req.ip,
    vnp_TxnRef: orderId,
    vnp_TransactionNo: 14422574,
    vnp_OrderInfo: description,
    vnp_TransactionDate: date,
    vnp_CreateDate: date,
  });
});







// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}11`);
});
