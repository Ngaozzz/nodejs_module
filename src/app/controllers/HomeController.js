class HomeController {
    // GET /booking
    index(req, res) {
        res.render('home'); // Render file Home.ejs / Home.pug / etc.
    }
}

module.exports = new HomeController();
