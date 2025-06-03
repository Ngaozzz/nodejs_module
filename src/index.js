// File: src/index.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();
const moment = require('moment');
const { requireAuth } = require('./middlewares/auth');

// Ensure all dependencies are installed:
// npm install express express-handlebars morgan method-override cookie-parser dotenv

const route = require('./routes');
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Connect to DB
app.use(cookieParser());
db.Connect();

// Static files
app.use(express.static(path.join(__dirname, 'public')));
console.log('Serving static from:', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'app')));

// Cấu hình Express để phục vụ các tệp tĩnh trong thư mục 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(flash());
// Logger
app.use(morgan('combined'));

// Method Override for PUT & DELETE
app.use(methodOverride('_method'));

// View Engine Setup
app.engine(
    'handlebars',
    engine({
       
        extname: '.handlebars',
        helpers: {
            // Block helper for strict comparison (e.g., selecting an option)
            ifCond: function (v1, operator, v2, options) {
                if (typeof options === 'undefined') {
                    // Trường hợp bị gọi sai => fallback tránh crash
                    return '';
                }

                switch (operator) {
                    case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
                    case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
                    case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
                    case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                    case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
                    case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                    case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
                    case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                    case '&&': return (v1 && v2) ? options.fn(this) : options.inverse(this);
                    case '||': return (v1 || v2) ? options.fn(this) : options.inverse(this);
                    default: return options.inverse(this);
                }
                },

            // Inline helpers returning boolean for subexpression usage, with undefined checks
            eq(a, b) {
                if (a == null || b == null) return false;
                try {
                    return a.toString() === b.toString();
                } catch (e) {
                    return false;
                }
            },
            ne(a, b) {
                if (a == null || b == null) return false;
                try {
                    return a.toString() !== b.toString();
                } catch (e) {
                    return false;
                }
            },
            lt(a, b) {
                if (a == null || b == null) return false;
                return a < b;
            },
            gt(a, b) {
                if (a == null || b == null) return false;
                return a > b;
            },
            and(a, b) {
                return Boolean(a && b);
            },
            or(a, b) {
                return Boolean(a || b);
            },
            formatDate(date) {
                return moment(date).format('YYYY-MM-DD'); // Định dạng ngày tháng theo ý muốn
            },

            formatDateTime(date) {
                return moment(date).format('YYYY-MM-DD HH:mm:ss'); // Định dạng ngày giờ theo ý muốn
            },

            subtract(a, b) {
                const numA = Number(a);
                const numB = Number(b);
                if (isNaN(numA) || isNaN(numB)) return 0;
                return numA - numB;
            },

        },
    }),
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'resources/views'));


app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    } catch (err) {
      // token sai thì vẫn cho qua nhưng không gán user
      req.user = null;
    }
  }
  next();
});
// Routes
route(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
