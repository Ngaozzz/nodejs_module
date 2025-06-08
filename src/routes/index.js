const bookingRouter = require('./booking');
const HomeRouter = require('./home');
const userRouter = require('./user');
const roomRouter = require('./room');
const paymentRouter = require('./payment');
const feedbackRouter = require('./feedback');
const roomTypeRouter = require('./roomType');
const adminRouter = require('./admin');

function route(app) {
    app.use('/', HomeRouter);
    app.use('/bookings', bookingRouter);
    app.use('/users', userRouter);
    app.use('/room-types', roomTypeRouter);
    app.use('/rooms', roomRouter);
    app.use('/payments', paymentRouter);
    app.use('/feedbacks', feedbackRouter);
    app.use('/admin', adminRouter);
    app.get('/service', (req, res) => {
        res.render('service'); // nếu bạn có file views/service.handlebars hoặc .ejs
    });
}

module.exports = route;
