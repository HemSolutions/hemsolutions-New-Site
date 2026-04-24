<?php
class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        $dbPath = __DIR__ . '/billing.db';
        $this->pdo = new PDO('sqlite:' . $dbPath);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->initializeTables();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function prepare($sql) {
        return $this->pdo->prepare($sql);
    }
    
    public function query($sql) {
        return $this->pdo->query($sql);
    }
    
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
    
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }
    
    public function commit() {
        return $this->pdo->commit();
    }
    
    public function rollBack() {
        return $this->pdo->rollBack();
    }
    
    public function inTransaction() {
        return $this->pdo->inTransaction();
    }
    
    private function initializeTables() {
        // Customers
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                city TEXT,
                postal_code TEXT,
                org_number TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Articles/Services
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                type TEXT CHECK(type IN ('product', 'service')),
                vat_rate REAL DEFAULT 25,
                is_rot_rut INTEGER DEFAULT 0,
                unit TEXT DEFAULT 'st',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Customer-specific prices
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS customer_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                article_id INTEGER NOT NULL,
                custom_price REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (article_id) REFERENCES articles(id)
            )
        ");
        
        // Invoices
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE NOT NULL,
                customer_id INTEGER NOT NULL,
                issue_date DATE NOT NULL,
                due_date DATE NOT NULL,
                total_amount REAL NOT NULL,
                vat_amount REAL NOT NULL,
                status TEXT CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
                is_rot_rut INTEGER DEFAULT 0,
                rot_rut_amount REAL DEFAULT 0,
                notes TEXT,
                reference TEXT,
                our_reference TEXT,
                payment_terms TEXT DEFAULT '30',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        ");
        
        // Invoice items
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                article_id INTEGER,
                article_name TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit_price REAL NOT NULL,
                vat_rate REAL DEFAULT 25,
                total_price REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            )
        ");
        
        // Receipts
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_number TEXT UNIQUE NOT NULL,
                customer_id INTEGER NOT NULL,
                issue_date DATE NOT NULL,
                total_amount REAL NOT NULL,
                vat_amount REAL NOT NULL,
                payment_method TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        ");
        
        // Receipt items
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS receipt_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_id INTEGER NOT NULL,
                article_id INTEGER,
                article_name TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit_price REAL NOT NULL,
                total_price REAL NOT NULL,
                FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
            )
        ");
        
        // Payments
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER,
                customer_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                payment_date DATE NOT NULL,
                payment_method TEXT,
                reference TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        ");
        
        // Reminders
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                invoice_number TEXT NOT NULL,
                customer_id INTEGER NOT NULL,
                customer_name TEXT NOT NULL,
                reminder_level INTEGER DEFAULT 1,
                reminder_date DATE NOT NULL,
                fee_amount REAL DEFAULT 0,
                status TEXT CHECK(status IN ('pending', 'sent', 'resolved')) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id)
            )
        ");
        
        // Workers
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS workers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                color TEXT DEFAULT '#3B82F6',
                role TEXT DEFAULT 'employee',
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Bookings
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                worker_id INTEGER NOT NULL,
                service_id INTEGER,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                duration_hours REAL NOT NULL,
                status TEXT CHECK(status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'pending',
                notes TEXT,
                is_recurring INTEGER DEFAULT 0,
                recurrence_rule TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (worker_id) REFERENCES workers(id),
                FOREIGN KEY (service_id) REFERENCES articles(id)
            )
        ");
        
        // Company settings
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS company_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL DEFAULT 'Demo AB',
                org_number TEXT,
                address TEXT,
                city TEXT,
                postal_code TEXT,
                phone TEXT,
                email TEXT,
                website TEXT,
                bankgiro TEXT,
                plusgiro TEXT,
                bank_account TEXT,
                vat_number TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Insert default settings if none exist
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM company_settings");
        if ($stmt->fetchColumn() == 0) {
            $this->pdo->exec("
                INSERT INTO company_settings 
                (company_name, org_number, address, city, postal_code, phone, email, website, bankgiro, plusgiro, bank_account, vat_number)
                VALUES 
                ('HemSolutions Sverige AB', '559123-4567', 'Företagsvägen 12', 'Malmö', '211 55', '070-123 45 67', 'info@hemsolutions.se', 'www.hemsolutions.se', '123-4567', '12 34 56-7', 'SE45 5000 0000 0580 1234 5678', 'SE559123456701')
            ");
        }
        
        // Update workers table schema if needed
        try {
            $this->pdo->exec("ALTER TABLE workers ADD COLUMN person_number TEXT");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE workers ADD COLUMN address TEXT");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE workers ADD COLUMN password TEXT");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE workers ADD COLUMN status TEXT DEFAULT 'available'");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE workers RENAME COLUMN is_active TO active");
        } catch (PDOException $e) {}

        // Messages
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_type TEXT NOT NULL,
                sender_id INTEGER NOT NULL,
                sender_name TEXT,
                recipient_type TEXT NOT NULL,
                recipient_id INTEGER NOT NULL,
                recipient_name TEXT,
                content TEXT NOT NULL,
                channel TEXT DEFAULT 'app',
                status TEXT DEFAULT 'sent',
                attachments TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Reklamationer
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS reklamationer (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT CHECK(status IN ('new', 'processing', 'resolved', 'rejected')) DEFAULT 'new',
                images TEXT DEFAULT '[]',
                share_with_customer INTEGER DEFAULT 0,
                share_with_worker INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        ");

        // Reklamation comments
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS reklamation_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reklamation_id INTEGER NOT NULL,
                author_type TEXT DEFAULT 'admin',
                author_name TEXT,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reklamation_id) REFERENCES reklamationer(id) ON DELETE CASCADE
            )
        ");

        $this->seedData();
    }
    
    private function seedData() {
        // Check if data already exists
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM customers");
        if ($stmt->fetchColumn() > 0) {
            return;
        }
        
        // Seed Workers
        $workers = [
            ['Johan Andersson', 'johan@hemsolutions.se', '070-111 11 11', '#EF4444', 'employee', 1],
            ['Maria Lindberg', 'maria@hemsolutions.se', '070-222 22 22', '#3B82F6', 'employee', 1],
            ['Erik Svensson', 'erik@hemsolutions.se', '070-333 33 33', '#10B981', 'employee', 1],
            ['Anna Karlsson', 'anna@hemsolutions.se', '070-444 44 44', '#F59E0B', 'employee', 1],
            ['Peter Nilsson', 'peter@hemsolutions.se', '070-555 55 55', '#8B5CF6', 'employee', 1],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO workers (name, email, phone, color, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ");
        foreach ($workers as $worker) {
            $stmt->execute($worker);
        }
        
        // Seed Customers (Swedish names and addresses)
        $customers = [
            ['Andersson Bygg AB', 'info@anderssonbygg.se', '073-123 45 67', 'Storgatan 15', 'Stockholm', '111 22', '556677-8899'],
            ['Maria Larsson', 'maria@example.com', '070-234 56 78', 'Lilla Vägen 3', 'Göteborg', '411 22', ''],
            ['Svensson Städ & Service', 'kontakt@svenssonstad.se', '072-345 67 89', 'Industrigatan 45', 'Malmö', '211 55', '556688-9900'],
            ['Johan Eriksson', 'johan@eriksson.se', '076-456 78 90', 'Kungsvägen 8', 'Uppsala', '753 20', ''],
            ['Nordic Tech Solutions', 'hello@nordictech.se', '073-567 89 01', 'Teknikvägen 12', 'Linköping', '583 30', '556699-0011'],
            ['Katarina Nilsson', 'katarina@nilsson.se', '070-678 90 12', 'Strandvägen 22', 'Helsingborg', '252 21', ''],
            ['Bengtsson Måleri', 'info@bengtssonmaleri.se', '072-789 01 23', 'Färgvägen 7', 'Örebro', '703 62', '556711-2233'],
            ['Emma Persson', 'emma@persson.se', '076-890 12 34', 'Parkgatan 18', 'Lund', '222 22', ''],
            ['Skandinaviska El & VVS', 'support@sevvs.se', '073-901 23 45', 'Rörvägen 33', 'Västerås', '721 34', '556722-3344'],
            ['Lars Olsson', 'lars@olsson.se', '070-012 34 56', 'Skogsvägen 5', 'Umeå', '903 26', ''],
            ['Fixare Johan AB', 'johan@fixare.se', '072-123 45 67', 'Hantverkaregatan 9', 'Jönköping', '553 18', '556733-4455'],
            ['Sofia Lindberg', 'sofia@lindberg.se', '076-234 56 78', 'Blomstervägen 14', 'Norrköping', '602 12', ''],
            ['Handyman Sverige', 'info@handymansverige.se', '073-345 67 89', 'Servicevägen 21', 'Karlstad', '652 25', '556744-5566'],
            ['Pettersson Byggnads', 'pettersson@byggnad.se', '070-456 78 90', 'Byggvägen 6', 'Eskilstuna', '632 21', ''],
            ['Anna Karlsson', 'anna@karlsson.se', '072-567 89 01', 'Lilla Torg 11', 'Trollhättan', '461 30', ''],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO customers (name, email, phone, address, city, postal_code, org_number, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ");
        foreach ($customers as $customer) {
            $stmt->execute($customer);
        }
        
        // Seed Articles/Services
        $articles = [
            ['ROT-arbete - Renovering', 'Renovering och reparationsarbete inomhus', 450, 'service', 25, 1, 'tim'],
            ['ROT-arbete - Målning', 'Målningsarbete inomhus', 380, 'service', 25, 1, 'tim'],
            ['RUT-arbete - Städning', 'Hemstädning', 280, 'service', 25, 1, 'tim'],
            ['RUT-arbete - Trädgård', 'Trädgårdsskötsel', 320, 'service', 25, 1, 'tim'],
            ['Elektriker', 'Elarbeten', 520, 'service', 25, 1, 'tim'],
            ['Rörmokare', 'VVS-arbeten', 580, 'service', 25, 1, 'tim'],
            ['Snickare', 'Snickeriarbeten', 490, 'service', 25, 1, 'tim'],
            ['Golvläggare', 'Golvbeläggning', 510, 'service', 25, 1, 'tim'],
            ['Väggmaterial - Gips', 'Gipsskivor standard', 85, 'product', 25, 0, 'm²'],
            ['Färg - Vit standard', 'Vit färg 10L', 450, 'product', 25, 0, 'burk'],
            ['Städprodukter', 'Miljövänliga städprodukter', 120, 'product', 25, 0, 'set'],
            ['Trädgårdsredskap', 'Säsongsinhyrning redskap', 200, 'service', 25, 1, 'dag'],
            ['Beskärning', 'Trädbeskärning', 400, 'service', 25, 1, 'tim'],
            ['Beredskap jour', 'Jourberedskap utanför arbetstid', 850, 'service', 25, 1, 'tim'],
            ['Konsultation', 'Projektkonsultation', 750, 'service', 25, 0, 'tim'],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO articles (name, description, price, type, vat_rate, is_rot_rut, unit, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ");
        foreach ($articles as $article) {
            $stmt->execute($article);
        }
        
        // Seed Bookings
        $today = date('Y-m-d');
        $bookings = [
            [1, 1, 3, "$today 09:00:00", "$today 12:00:00", 3, 'confirmed', 'Hemstädning - veckostädning', 0],
            [2, 2, 1, "$today 10:00:00", "$today 14:00:00", 4, 'confirmed', 'Renovering badrum', 0],
            [3, 3, 5, date('Y-m-d', strtotime('+1 day')) . ' 08:00:00', date('Y-m-d', strtotime('+1 day')) . ' 12:00:00', 4, 'pending', 'Elarbete - nyinstallation', 0],
            [4, 4, 2, date('Y-m-d', strtotime('+1 day')) . ' 13:00:00', date('Y-m-d', strtotime('+1 day')) . ' 17:00:00', 4, 'confirmed', 'Målning vardagsrum', 0],
            [5, 1, 4, date('Y-m-d', strtotime('+2 days')) . ' 09:00:00', date('Y-m-d', strtotime('+2 days')) . ' 13:00:00', 4, 'confirmed', 'Trädgårdsskötsel', 0],
            [6, 5, 6, date('Y-m-d', strtotime('+2 days')) . ' 10:00:00', date('Y-m-d', strtotime('+2 days')) . ' 15:00:00', 5, 'pending', 'VVS-arbete kök', 0],
            [7, 2, 7, date('Y-m-d', strtotime('+3 days')) . ' 08:00:00', date('Y-m-d', strtotime('+3 days')) . ' 16:00:00', 8, 'confirmed', 'Snickeriarbete', 0],
            [8, 3, 1, date('Y-m-d', strtotime('-1 day')) . ' 09:00:00', date('Y-m-d', strtotime('-1 day')) . ' 12:00:00', 3, 'confirmed', 'Hemstädning', 0],
            [9, 4, 8, date('Y-m-d', strtotime('-1 day')) . ' 10:00:00', date('Y-m-d', strtotime('-1 day')) . ' 18:00:00', 8, 'cancelled', 'Golvläggning', 0],
            [10, 5, 2, date('Y-m-d', strtotime('+4 days')) . ' 09:00:00', date('Y-m-d', strtotime('+4 days')) . ' 12:00:00', 3, 'pending', 'Målning kontor', 0],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO bookings (customer_id, worker_id, service_id, start_time, end_time, duration_hours, status, notes, is_recurring, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ");
        foreach ($bookings as $booking) {
            $stmt->execute($booking);
        }
        
        // Seed Invoices
        $invoiceData = [
            [1, 4500, 'paid', 'F-2025-0001', date('Y-m-d', strtotime('-45 days')), date('Y-m-d', strtotime('-15 days'))],
            [2, 2800, 'paid', 'F-2025-0002', date('Y-m-d', strtotime('-40 days')), date('Y-m-d', strtotime('-10 days'))],
            [3, 5200, 'sent', 'F-2025-0003', date('Y-m-d', strtotime('-30 days')), date('Y-m-d', strtotime('now'))],
            [4, 1800, 'paid', 'F-2025-0004', date('Y-m-d', strtotime('-25 days')), date('Y-m-d', strtotime('-5 days'))],
            [5, 8900, 'overdue', 'F-2025-0005', date('Y-m-d', strtotime('-60 days')), date('Y-m-d', strtotime('-30 days'))],
            [6, 3400, 'paid', 'F-2025-0006', date('Y-m-d', strtotime('-20 days')), date('Y-m-d', strtotime('now'))],
            [7, 6200, 'sent', 'F-2025-0007', date('Y-m-d', strtotime('-15 days')), date('Y-m-d', strtotime('+15 days'))],
            [8, 2100, 'paid', 'F-2025-0008', date('Y-m-d', strtotime('-10 days')), date('Y-m-d', strtotime('+20 days'))],
            [9, 7800, 'sent', 'F-2025-0009', date('Y-m-d', strtotime('-7 days')), date('Y-m-d', strtotime('+23 days'))],
            [10, 1500, 'paid', 'F-2025-0010', date('Y-m-d', strtotime('-5 days')), date('Y-m-d', strtotime('+25 days'))],
            [11, 4200, 'draft', 'F-2025-0011', date('Y-m-d', strtotime('-2 days')), date('Y-m-d', strtotime('+28 days'))],
            [12, 2900, 'paid', 'F-2025-0012', date('Y-m-d', strtotime('-35 days')), date('Y-m-d', strtotime('-5 days'))],
            [13, 5600, 'overdue', 'F-2025-0013', date('Y-m-d', strtotime('-50 days')), date('Y-m-d', strtotime('-20 days'))],
            [14, 3800, 'sent', 'F-2025-0014', date('Y-m-d', strtotime('-12 days')), date('Y-m-d', strtotime('+18 days'))],
            [1, 7200, 'paid', 'F-2025-0015', date('Y-m-d', strtotime('-8 days')), date('Y-m-d', strtotime('+22 days'))],
            [2, 1600, 'draft', 'F-2025-0016', date('Y-m-d', strtotime('-1 day')), date('Y-m-d', strtotime('+29 days'))],
            [3, 4800, 'paid', 'F-2025-0017', date('Y-m-d', strtotime('-22 days')), date('Y-m-d', strtotime('now'))],
            [4, 2300, 'sent', 'F-2025-0018', date('Y-m-d', strtotime('-18 days')), date('Y-m-d', strtotime('+12 days'))],
            [5, 8500, 'overdue', 'F-2025-0019', date('Y-m-d', strtotime('-55 days')), date('Y-m-d', strtotime('-25 days'))],
            [6, 3100, 'paid', 'F-2025-0020', date('Y-m-d', strtotime('-14 days')), date('Y-m-d', strtotime('+16 days'))],
            [7, 5900, 'sent', 'F-2025-0021', date('Y-m-d', strtotime('-9 days')), date('Y-m-d', strtotime('+21 days'))],
            [8, 1900, 'draft', 'F-2025-0022', date('Y-m-d', strtotime('-3 days')), date('Y-m-d', strtotime('+27 days'))],
            [9, 7400, 'paid', 'F-2025-0023', date('Y-m-d', strtotime('-28 days')), date('Y-m-d', strtotime('-2 days'))],
            [10, 2700, 'sent', 'F-2025-0024', date('Y-m-d', strtotime('-6 days')), date('Y-m-d', strtotime('+24 days'))],
            [11, 4100, 'paid', 'F-2025-0025', date('Y-m-d', strtotime('-11 days')), date('Y-m-d', strtotime('+19 days'))],
            [12, 3300, 'overdue', 'F-2025-0026', date('Y-m-d', strtotime('-45 days')), date('Y-m-d', strtotime('-15 days'))],
            [13, 5000, 'paid', 'F-2025-0027', date('Y-m-d', strtotime('-19 days')), date('Y-m-d', strtotime('+11 days'))],
            [14, 2200, 'sent', 'F-2025-0028', date('Y-m-d', strtotime('-13 days')), date('Y-m-d', strtotime('+17 days'))],
            [15, 6800, 'paid', 'F-2025-0029', date('Y-m-d', strtotime('-4 days')), date('Y-m-d', strtotime('+26 days'))],
            [1, 3600, 'draft', 'F-2025-0030', date('Y-m-d', strtotime('-1 day')), date('Y-m-d', strtotime('+29 days'))],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, total_amount, vat_amount, status, is_rot_rut, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, '', datetime('now'), datetime('now'))
        ");
        foreach ($invoiceData as $inv) {
            $vat = $inv[1] * 0.25;
            $stmt->execute([$inv[3], $inv[0], $inv[4], $inv[5], $inv[1], $vat, $inv[2]]);
        }
        
        // Seed Invoice Items
        $invoiceItems = [
            [1, 1, 'ROT-arbete - Renovering', 8, 450, 25, 3600],
            [1, 9, 'Väggmaterial - Gips', 10, 85, 25, 850],
            [2, 3, 'RUT-arbete - Städning', 10, 280, 25, 2800],
            [3, 5, 'Elektriker', 10, 520, 25, 5200],
            [4, 3, 'RUT-arbete - Städning', 6, 280, 25, 1680],
            [4, 11, 'Städprodukter', 1, 120, 25, 120],
            [5, 1, 'ROT-arbete - Renovering', 15, 450, 25, 6750],
            [5, 9, 'Väggmaterial - Gips', 25, 85, 25, 2125],
            [6, 2, 'ROT-arbete - Målning', 8, 380, 25, 3040],
            [6, 10, 'Färg - Vit standard', 1, 450, 25, 360],
            [7, 6, 'Rörmokare', 10, 580, 25, 5800],
            [8, 3, 'RUT-arbete - Städning', 7, 280, 25, 1960],
            [8, 11, 'Städprodukter', 1, 140, 25, 140],
            [9, 7, 'Snickare', 12, 490, 25, 5880],
            [9, 1, 'ROT-arbete - Renovering', 4, 450, 25, 1920],
            [10, 3, 'RUT-arbete - Städning', 5, 280, 25, 1400],
            [10, 4, 'RUT-arbete - Trädgård', 3, 320, 25, 960],
            [11, 5, 'Elektriker', 8, 520, 25, 4160],
            [12, 2, 'ROT-arbete - Målning', 7, 380, 25, 2660],
            [12, 10, 'Färg - Vit standard', 1, 450, 25, 240],
            [13, 6, 'Rörmokare', 8, 580, 25, 4640],
            [13, 14, 'Beredskap jour', 1, 850, 25, 960],
            [14, 8, 'Golvläggare', 7, 510, 25, 3570],
            [15, 1, 'ROT-arbete - Renovering', 12, 450, 25, 5400],
            [15, 2, 'ROT-arbete - Målning', 4, 380, 25, 1520],
            [15, 9, 'Väggmaterial - Gips', 3, 85, 25, 255],
            [16, 3, 'RUT-arbete - Städning', 5, 280, 25, 1400],
            [16, 4, 'RUT-arbete - Trädgård', 3, 320, 25, 960],
            [16, 12, 'Trädgårdsredskap', 1, 200, 25, 240],
            [17, 7, 'Snickare', 8, 490, 25, 3920],
            [17, 2, 'ROT-arbete - Målning', 2, 380, 25, 760],
            [18, 5, 'Elektriker', 4, 520, 25, 2080],
            [18, 15, 'Konsultation', 1, 750, 25, 220],
            [19, 6, 'Rörmokare', 12, 580, 25, 6960],
            [19, 14, 'Beredskap jour', 2, 850, 25, 1540],
            [20, 4, 'RUT-arbete - Trädgård', 8, 320, 25, 2560],
            [20, 13, 'Beskärning', 2, 400, 25, 800],
            [21, 8, 'Golvläggare', 10, 510, 25, 5100],
            [21, 1, 'ROT-arbete - Renovering', 2, 450, 25, 800],
            [22, 3, 'RUT-arbete - Städning', 6, 280, 25, 1680],
            [22, 4, 'RUT-arbete - Trädgård', 3, 320, 25, 220],
            [23, 7, 'Snickare', 10, 490, 25, 4900],
            [23, 8, 'Golvläggare', 4, 510, 25, 2040],
            [23, 9, 'Väggmaterial - Gips', 5, 85, 25, 460],
            [24, 2, 'ROT-arbete - Målning', 6, 380, 25, 2280],
            [24, 10, 'Färg - Vit standard', 1, 450, 25, 420],
            [25, 5, 'Elektriker', 7, 520, 25, 3640],
            [25, 15, 'Konsultation', 1, 750, 25, 420],
            [26, 1, 'ROT-arbete - Renovering', 5, 450, 25, 2250],
            [26, 2, 'ROT-arbete - Målning', 3, 380, 25, 1140],
            [26, 6, 'Rörmokare', 2, 580, 25, 1160],
            [27, 4, 'RUT-arbete - Trädgård', 10, 320, 25, 3200],
            [27, 12, 'Trädgårdsredskap', 5, 200, 25, 1000],
            [27, 13, 'Beskärning', 2, 400, 25, 800],
            [28, 6, 'Rörmokare', 3, 580, 25, 1740],
            [28, 15, 'Konsultation', 1, 750, 25, 460],
            [29, 1, 'ROT-arbete - Renovering', 10, 450, 25, 4500],
            [29, 2, 'ROT-arbete - Målning', 5, 380, 25, 1900],
            [29, 9, 'Väggmaterial - Gips', 5, 85, 25, 400],
            [30, 5, 'Elektriker', 6, 520, 25, 3120],
            [30, 8, 'Golvläggare', 1, 510, 25, 480],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO invoice_items (invoice_id, article_id, article_name, quantity, unit_price, vat_rate, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($invoiceItems as $item) {
            $stmt->execute($item);
        }
        
        // Seed Receipts
        $receipts = [
            [2, 850, date('Y-m-d', strtotime('-38 days')), 'swish'],
            [4, 1200, date('Y-m-d', strtotime('-22 days')), 'card'],
            [6, 2800, date('Y-m-d', strtotime('-18 days')), 'bank_transfer'],
            [8, 950, date('Y-m-d', strtotime('-8 days')), 'cash'],
            [10, 1500, date('Y-m-d', strtotime('-3 days')), 'swish'],
            [12, 2400, date('Y-m-d', strtotime('-28 days')), 'card'],
            [15, 4500, date('Y-m-d', strtotime('-5 days')), 'bank_transfer'],
            [17, 3500, date('Y-m-d', strtotime('-20 days')), 'swish'],
            [20, 2200, date('Y-m-d', strtotime('-12 days')), 'card'],
            [23, 5800, date('Y-m-d', strtotime('-25 days')), 'bank_transfer'],
        ];
        
        $year = date('Y');
        $stmt = $this->pdo->prepare("
            INSERT INTO receipts (receipt_number, customer_id, issue_date, total_amount, vat_amount, payment_method, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ");
        foreach ($receipts as $i => $receipt) {
            $receiptNum = "K-$year-" . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
            $vat = $receipt[1] * 0.25;
            $stmt->execute([$receiptNum, $receipt[0], $receipt[2], $receipt[1], $vat, $receipt[3]]);
        }
        
        // Seed Receipt Items
        $receiptItems = [
            [1, 3, 'RUT-arbete - Städning', 3, 280, 840],
            [1, 11, 'Städprodukter', 1, 120, 120],
            [2, 5, 'Elektriker', 2, 520, 1040],
            [2, 15, 'Konsultation', 1, 750, 160],
            [3, 2, 'ROT-arbete - Målning', 7, 380, 2660],
            [3, 10, 'Färg - Vit standard', 1, 450, 140],
            [4, 3, 'RUT-arbete - Städning', 3, 280, 840],
            [4, 4, 'RUT-arbete - Trädgård', 2, 320, 110],
            [5, 4, 'RUT-arbete - Trädgård', 4, 320, 1280],
            [5, 12, 'Trädgårdsredskap', 1, 200, 220],
            [6, 2, 'ROT-arbete - Målning', 6, 380, 2280],
            [6, 10, 'Färg - Vit standard', 1, 450, 120],
            [7, 1, 'ROT-arbete - Renovering', 8, 450, 3600],
            [7, 9, 'Väggmaterial - Gips', 10, 85, 850],
            [8, 7, 'Snickare', 7, 490, 3430],
            [8, 2, 'ROT-arbete - Målning', 2, 380, 70],
            [9, 4, 'RUT-arbete - Trädgård', 6, 320, 1920],
            [9, 13, 'Beskärning', 1, 400, 280],
            [10, 7, 'Snickare', 10, 490, 4900],
            [10, 8, 'Golvläggare', 2, 510, 900],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO receipt_items (receipt_id, article_id, article_name, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($receiptItems as $item) {
            $stmt->execute($item);
        }
        
        // Seed Payments
        $payments = [
            [1, 1, 4500, date('Y-m-d', strtotime('-15 days')), 'bank_transfer', 'F-2025-0001'],
            [2, 2, 2800, date('Y-m-d', strtotime('-10 days')), 'swish', 'F-2025-0002'],
            [4, 4, 1800, date('Y-m-d', strtotime('-5 days')), 'card', 'F-2025-0004'],
            [6, 6, 3400, date('Y-m-d', strtotime('now')), 'bank_transfer', 'F-2025-0006'],
            [8, 8, 2100, date('Y-m-d', strtotime('+5 days')), 'swish', 'F-2025-0008'],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO payments (invoice_id, customer_id, amount, payment_date, payment_method, reference, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ");
        foreach ($payments as $pay) {
            $stmt->execute($pay);
        }
        
        // Seed Reminders
        $reminders = [
            [5, 'F-2025-0005', 5, 'Andersson Bygg AB', 1, date('Y-m-d', strtotime('+7 days')), 60, 'pending'],
            [13, 'F-2025-0013', 3, 'Svensson Städ & Service', 2, date('Y-m-d', strtotime('+3 days')), 180, 'pending'],
            [19, 'F-2025-0019', 5, 'Nordic Tech Solutions', 3, date('Y-m-d', strtotime('+1 day')), 300, 'pending'],
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT INTO reminders (invoice_id, invoice_number, customer_id, customer_name, reminder_level, reminder_date, fee_amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ");
        foreach ($reminders as $rem) {
            $stmt->execute($rem);
        }
    }
}
?>