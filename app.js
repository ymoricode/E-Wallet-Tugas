/**
 * ============================================
 * E-WALLET - Aplikasi Simulasi Pengujian Sistem
 * ============================================
 * 
 * Dibuat untuk kebutuhan pengujian fungsional 
 * sistem E-Wallet. Semua data disimpan di Local Storage.
 * 
 * Fitur:
 * - Login User (TC-01, TC-02)
 * - Top Up Saldo (TC-03, TC-04)
 * - Transfer Saldo (TC-05, TC-06, TC-07, TC-08)
 * - Validasi PIN (TC-09, TC-10)
 * - Riwayat Transaksi
 * 
 * @author Senior Frontend Developer
 * @version 1.0.0
 */

// ============================================
// KONSTANTA & KONFIGURASI
// ============================================

/**
 * Key untuk menyimpan data di Local Storage
 */
const STORAGE_KEYS = {
    USERS: 'ewallet_users',           // Data semua user
    CURRENT_USER: 'ewallet_current',  // Username user yang sedang login
    TRANSACTIONS: 'ewallet_transactions', // Data semua transaksi
    INITIALIZED: 'ewallet_initialized'   // Flag apakah data awal sudah dibuat
};

/**
 * Data dummy user default
 * Dibuat otomatis saat aplikasi pertama kali dijalankan
 */
const DEFAULT_USERS = [
    {
        username: 'user1',
        password: '123456',
        pin: '123456',
        balance: 100000,
        accountNumber: 'ACC-20250001'
    },
    {
        username: 'user2',
        password: '123456',
        pin: '654321',
        balance: 50000,
        accountNumber: 'ACC-20250002'
    }
];

// ============================================
// INISIALISASI DATA
// ============================================

/**
 * Inisialisasi data default ke Local Storage
 * Hanya dijalankan saat pertama kali aplikasi dibuka
 * atau saat data belum ada di Local Storage
 */
function initializeDefaultData() {
    // Cek apakah data sudah pernah diinisialisasi
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

    if (!initialized) {
        // Simpan data user default ke Local Storage
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));

        // Buat array kosong untuk transaksi
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));

        // Tandai bahwa data sudah diinisialisasi
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

        console.log('✅ Data default berhasil diinisialisasi');
        console.log('📋 User 1: user1 / 123456 (PIN: 123456, Saldo: Rp100.000)');
        console.log('📋 User 2: user2 / 123456 (PIN: 654321, Saldo: Rp50.000)');
    }
}

// ============================================
// FUNGSI UTILITAS LOCAL STORAGE
// ============================================

/**
 * Mengambil semua data user dari Local Storage
 * @returns {Array} Array of user objects
 */
function getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
}

/**
 * Menyimpan data user ke Local Storage
 * @param {Array} users - Array of user objects
 */
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Mencari user berdasarkan username
 * @param {string} username - Username yang dicari
 * @returns {Object|null} User object atau null jika tidak ditemukan
 */
function findUser(username) {
    const users = getUsers();
    return users.find(u => u.username === username) || null;
}

/**
 * Mengambil data user yang sedang login
 * @returns {Object|null} User object atau null
 */
function getCurrentUser() {
    const username = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!username) return null;
    return findUser(username);
}

/**
 * Menyimpan username user yang sedang login
 * @param {string} username 
 */
function setCurrentUser(username) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
}

/**
 * Menghapus sesi login (logout)
 */
function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Update saldo user
 * @param {string} username - Username
 * @param {number} newBalance - Saldo baru
 */
function updateUserBalance(username, newBalance) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        users[userIndex].balance = newBalance;
        saveUsers(users);
    }
}

/**
 * Mengambil semua transaksi dari Local Storage
 * @returns {Array} Array of transaction objects
 */
function getTransactions() {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
}

/**
 * Menyimpan transaksi baru ke Local Storage
 * @param {Object} transaction - Object transaksi
 */
function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.unshift(transaction); // Tambahkan di awal (terbaru di atas)
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

/**
 * Mengambil transaksi milik user tertentu
 * @param {string} username - Username
 * @returns {Array} Array of transactions
 */
function getUserTransactions(username) {
    const transactions = getTransactions();
    // Filter transaksi yang terkait dengan user ini
    return transactions.filter(t => t.user === username || t.to === username);
}

// ============================================
// FUNGSI UTILITAS FORMAT
// ============================================

/**
 * Format angka ke format mata uang Rupiah
 * @param {number} amount - Nominal
 * @returns {string} Format Rp
 */
function formatCurrency(amount) {
    return 'Rp' + amount.toLocaleString('id-ID');
}

/**
 * Format tanggal ke format Indonesia
 * @param {string} dateString - ISO date string
 * @returns {string} Format tanggal Indonesia
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format tanggal pendek (untuk preview)
 * @param {string} dateString - ISO date string
 * @returns {string} Format pendek
 */
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    // Tampilkan relatif jika kurang dari 24 jam
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;

    // Jika lebih dari 24 jam, tampilkan tanggal
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short'
    });
}

/**
 * Mendapatkan ucapan sapaan berdasarkan waktu
 * @returns {string} Ucapan sapaan
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Selamat Pagi,';
    if (hour >= 12 && hour < 15) return 'Selamat Siang,';
    if (hour >= 15 && hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
}

// ============================================
// NAVIGASI HALAMAN
// ============================================

/**
 * Berpindah antar halaman (SPA navigation)
 * @param {string} pageId - ID halaman tujuan
 */
function navigateTo(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Tampilkan halaman tujuan
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Scroll ke atas
    window.scrollTo(0, 0);
}

// ============================================
// TOAST NOTIFICATION
// ============================================

/**
 * Menampilkan toast notification
 * @param {string} message - Pesan yang ditampilkan
 * @param {string} type - Tipe: 'success', 'error', 'info'
 * @param {number} duration - Durasi tampil dalam ms (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');

    // Buat elemen toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon berdasarkan tipe
    const icons = {
        success: '✅',
        error: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Hilangkan toast setelah durasi tertentu
    setTimeout(() => {
        toast.classList.add('toast-out');
        // Hapus elemen setelah animasi selesai
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// MODUL: LOGIN
// ============================================

/**
 * Menangani proses login user
 * Mendukung Test Case: TC-01, TC-02
 */
function handleLogin(event) {
    event.preventDefault();

    // Ambil nilai input
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Elemen pesan error
    const errorEl = document.getElementById('login-error');

    // Reset pesan error
    errorEl.classList.remove('show');
    errorEl.textContent = '';

    // Validasi: Username tidak boleh kosong
    if (!username) {
        showError(errorEl, 'Username tidak boleh kosong');
        return;
    }

    // Validasi: Password tidak boleh kosong
    if (!password) {
        showError(errorEl, 'Password tidak boleh kosong');
        return;
    }

    // Cari user di database
    const user = findUser(username);

    // TC-02: User tidak ditemukan
    if (!user) {
        showError(errorEl, 'Username tidak ditemukan');
        return;
    }

    // TC-02: Password salah
    if (user.password !== password) {
        showError(errorEl, 'Password salah');
        return;
    }

    // TC-01: Login berhasil
    setCurrentUser(username);
    showToast(`Selamat datang, ${username}!`, 'success');

    // Reset form login
    document.getElementById('form-login').reset();
    errorEl.classList.remove('show');

    // Pindah ke dashboard
    loadDashboard();
    navigateTo('page-dashboard');
}

/**
 * Menampilkan pesan error pada elemen
 * @param {HTMLElement} element - Elemen pesan error
 * @param {string} message - Pesan yang ditampilkan
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

/**
 * Menampilkan pesan pada elemen (error/success)
 * @param {HTMLElement} element - Elemen pesan
 * @param {string} message - Pesan
 * @param {string} type - 'error' atau 'success'
 */
function showMessage(element, message, type = 'error') {
    element.textContent = message;
    element.className = `message show ${type}`;
}

/**
 * Reset pesan pada elemen
 * @param {HTMLElement} element - Elemen pesan
 */
function clearMessage(element) {
    element.textContent = '';
    element.className = 'message';
}

/**
 * Menangani proses logout
 */
function handleLogout() {
    clearCurrentUser();
    showToast('Berhasil logout', 'info');
    navigateTo('page-login');
}

// ============================================
// MODUL: DASHBOARD
// ============================================

/**
 * Memuat dan menampilkan data dashboard
 */
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        navigateTo('page-login');
        return;
    }

    // Update greeting
    document.getElementById('greeting-text').textContent = getGreeting();

    // Update nama user
    document.getElementById('display-username').textContent = user.username;

    // Update avatar (huruf pertama username)
    document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();

    // Update nomor akun
    document.getElementById('account-number').textContent = user.accountNumber;

    // Update saldo
    document.getElementById('balance-amount').textContent = formatCurrency(user.balance);

    // Load transaksi terakhir (3 terbaru)
    loadRecentTransactions(user.username);
}

/**
 * Memuat 3 transaksi terakhir untuk ditampilkan di dashboard
 * @param {string} username - Username
 */
function loadRecentTransactions(username) {
    const container = document.getElementById('recent-transactions');
    const transactions = getUserTransactions(username);

    // Ambil 3 transaksi terbaru
    const recent = transactions.slice(0, 3);

    // Jika tidak ada transaksi
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="recent-empty">
                <p>Belum ada transaksi</p>
            </div>
        `;
        return;
    }

    // Render transaksi terakhir
    container.innerHTML = recent.map(tx => {
        const info = getTransactionDisplayInfo(tx, username);
        return `
            <div class="recent-item">
                <div class="recent-icon ${info.iconClass}">
                    ${info.icon}
                </div>
                <div class="recent-info">
                    <p class="recent-title">${info.title}</p>
                    <p class="recent-date">${formatDateShort(tx.date)}</p>
                </div>
                <span class="recent-amount ${info.amountClass}">${info.amountText}</span>
            </div>
        `;
    }).join('');
}

/**
 * Mendapatkan informasi tampilan untuk transaksi
 * @param {Object} tx - Object transaksi
 * @param {string} username - Username pemilik
 * @returns {Object} Informasi tampilan
 */
function getTransactionDisplayInfo(tx, username) {
    // Icon SVG
    const icons = {
        topup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        transfer_out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        transfer_in: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
    };

    if (tx.type === 'topup') {
        return {
            title: 'Top Up',
            icon: icons.topup,
            iconClass: 'topup',
            amountText: '+' + formatCurrency(tx.amount),
            amountClass: 'positive'
        };
    }

    // Jika ini transaksi transfer
    if (tx.type === 'transfer') {
        // Cek apakah user ini pengirim atau penerima
        if (tx.user === username) {
            // User adalah pengirim (Transfer Keluar)
            return {
                title: `Transfer ke ${tx.to}`,
                icon: icons.transfer_out,
                iconClass: 'transfer-out',
                amountText: '-' + formatCurrency(tx.amount),
                amountClass: 'negative'
            };
        } else {
            // User adalah penerima (Transfer Masuk)
            return {
                title: `Transfer dari ${tx.user}`,
                icon: icons.transfer_in,
                iconClass: 'transfer-in',
                amountText: '+' + formatCurrency(tx.amount),
                amountClass: 'positive'
            };
        }
    }

    // Default
    return {
        title: 'Transaksi',
        icon: '',
        iconClass: '',
        amountText: formatCurrency(tx.amount),
        amountClass: ''
    };
}

// ============================================
// MODUL: TOP UP
// ============================================

/**
 * Menangani proses top up saldo
 * Mendukung Test Case: TC-03, TC-04
 */
function handleTopUp(event) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) return;

    // Ambil nominal dari input
    const amountInput = document.getElementById('topup-amount');
    const amount = Number(amountInput.value);

    // Elemen pesan
    const messageEl = document.getElementById('topup-message');
    clearMessage(messageEl);

    // TC-04: Validasi nominal tidak valid
    if (!amountInput.value || amountInput.value.trim() === '') {
        showMessage(messageEl, 'Nominal tidak boleh kosong', 'error');
        return;
    }

    // TC-04: Nominal harus lebih dari 0
    if (amount <= 0) {
        showMessage(messageEl, 'Nominal tidak valid', 'error');
        return;
    }

    // TC-03: Top Up Berhasil
    // Hitung saldo baru
    const newBalance = user.balance + amount;

    // Update saldo di Local Storage
    updateUserBalance(user.username, newBalance);

    // Simpan transaksi ke riwayat
    addTransaction({
        id: Date.now(),
        type: 'topup',
        user: user.username,
        amount: amount,
        date: new Date().toISOString(),
        status: 'Berhasil'
    });

    // Reset form
    amountInput.value = '';
    clearQuickAmountSelection();

    // Tampilkan modal sukses
    showSuccessModal(
        'Top Up Berhasil!',
        `Saldo Anda telah bertambah ${formatCurrency(amount)}. Saldo saat ini: ${formatCurrency(newBalance)}`
    );

    console.log(`✅ TC-03: Top Up ${formatCurrency(amount)} berhasil. Saldo baru: ${formatCurrency(newBalance)}`);
}

/**
 * Memuat halaman Top Up
 */
function loadTopUpPage() {
    const user = getCurrentUser();
    if (!user) return;

    // Update saldo saat ini
    document.getElementById('topup-current-balance').textContent = formatCurrency(user.balance);

    // Reset form
    document.getElementById('form-topup').reset();
    clearMessage(document.getElementById('topup-message'));
    clearQuickAmountSelection();
}

/**
 * Menghapus seleksi quick amount
 */
function clearQuickAmountSelection() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// ============================================
// MODUL: TRANSFER
// ============================================

/**
 * Menangani proses transfer saldo antar user
 * Mendukung Test Case: TC-05, TC-06, TC-07, TC-08, TC-09, TC-10
 */
function handleTransfer(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Ambil nilai input
    const toUsername = document.getElementById('transfer-to').value.trim();
    const amount = Number(document.getElementById('transfer-amount').value);
    const pin = document.getElementById('transfer-pin').value;

    // Elemen pesan
    const messageEl = document.getElementById('transfer-message');
    clearMessage(messageEl);

    // Validasi: Username tujuan tidak boleh kosong
    if (!toUsername) {
        showMessage(messageEl, 'Username tujuan tidak boleh kosong', 'error');
        return;
    }

    // Validasi: Tidak boleh transfer ke diri sendiri
    if (toUsername === currentUser.username) {
        showMessage(messageEl, 'Tidak dapat transfer ke diri sendiri', 'error');
        return;
    }

    // TC-06: User tujuan harus ditemukan
    const targetUser = findUser(toUsername);
    if (!targetUser) {
        showMessage(messageEl, 'User tidak ditemukan', 'error');
        console.log(`❌ TC-06: User "${toUsername}" tidak ditemukan`);
        return;
    }

    // Validasi: Nominal harus lebih dari 0
    if (!amount || amount <= 0) {
        showMessage(messageEl, 'Nominal tidak valid', 'error');
        return;
    }

    // TC-08: Validasi saldo mencukupi
    if (currentUser.balance < amount) {
        showMessage(messageEl, 'Saldo tidak cukup', 'error');
        console.log(`❌ TC-08: Saldo ${formatCurrency(currentUser.balance)} tidak cukup untuk transfer ${formatCurrency(amount)}`);
        return;
    }

    // Validasi: PIN tidak boleh kosong
    if (!pin) {
        showMessage(messageEl, 'PIN tidak boleh kosong', 'error');
        return;
    }

    // TC-10: Validasi PIN
    if (pin !== currentUser.pin) {
        showMessage(messageEl, 'PIN salah', 'error');
        console.log(`❌ TC-10: PIN "${pin}" salah`);
        return;
    }

    // TC-05, TC-07, TC-09: Transfer Berhasil
    // Kurangi saldo pengirim
    const senderNewBalance = currentUser.balance - amount;
    updateUserBalance(currentUser.username, senderNewBalance);

    // Tambah saldo penerima
    const receiverNewBalance = targetUser.balance + amount;
    updateUserBalance(targetUser.username, receiverNewBalance);

    // Simpan transaksi ke riwayat
    addTransaction({
        id: Date.now(),
        type: 'transfer',
        user: currentUser.username,
        to: targetUser.username,
        amount: amount,
        date: new Date().toISOString(),
        status: 'Berhasil'
    });

    // Reset form
    document.getElementById('form-transfer').reset();

    // Tampilkan modal sukses
    showSuccessModal(
        'Transfer Berhasil!',
        `${formatCurrency(amount)} berhasil ditransfer ke ${toUsername}. Saldo Anda saat ini: ${formatCurrency(senderNewBalance)}`
    );

    console.log(`✅ TC-05: Transfer ${formatCurrency(amount)} ke ${toUsername} berhasil`);
    console.log(`   Saldo pengirim: ${formatCurrency(senderNewBalance)}`);
    console.log(`   Saldo penerima: ${formatCurrency(receiverNewBalance)}`);
}

/**
 * Memuat halaman Transfer
 */
function loadTransferPage() {
    const user = getCurrentUser();
    if (!user) return;

    // Update saldo saat ini
    document.getElementById('transfer-current-balance').textContent = formatCurrency(user.balance);

    // Reset form
    document.getElementById('form-transfer').reset();
    clearMessage(document.getElementById('transfer-message'));
}

// ============================================
// MODUL: RIWAYAT TRANSAKSI
// ============================================

/** Filter aktif saat ini */
let currentFilter = 'all';

/**
 * Memuat halaman riwayat transaksi
 */
function loadHistoryPage() {
    currentFilter = 'all';
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
    renderHistory();
}

/**
 * Merender tabel riwayat transaksi berdasarkan filter
 */
function renderHistory() {
    const user = getCurrentUser();
    if (!user) return;

    const tbody = document.getElementById('history-tbody');
    const emptyState = document.getElementById('history-empty');
    const tableWrapper = document.querySelector('.history-table-wrapper');
    let transactions = getUserTransactions(user.username);

    // Filter transaksi berdasarkan tipe
    if (currentFilter !== 'all') {
        transactions = transactions.filter(tx => {
            if (currentFilter === 'topup') return tx.type === 'topup';
            if (currentFilter === 'transfer_out') return tx.type === 'transfer' && tx.user === user.username;
            if (currentFilter === 'transfer_in') return tx.type === 'transfer' && tx.to === user.username;
            return true;
        });
    }

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
        tbody.innerHTML = '';
        tableWrapper.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Tampilkan tabel
    tableWrapper.style.display = 'block';
    emptyState.style.display = 'none';

    // Render baris tabel
    tbody.innerHTML = transactions.map(tx => {
        const info = getTransactionTableInfo(tx, user.username);
        return `
            <tr>
                <td>${formatDate(tx.date)}</td>
                <td><span class="badge ${info.badgeClass}">${info.typeLabel}</span></td>
                <td class="${info.amountClass}">${info.amountText}</td>
                <td><span class="badge badge-success">✓ ${tx.status}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Mendapatkan informasi tampilan untuk tabel riwayat
 * @param {Object} tx - Object transaksi
 * @param {string} username - Username pemilik
 * @returns {Object} Informasi tampilan
 */
function getTransactionTableInfo(tx, username) {
    if (tx.type === 'topup') {
        return {
            typeLabel: '↑ Top Up',
            badgeClass: 'badge-topup',
            amountText: '+' + formatCurrency(tx.amount),
            amountClass: 'amount-positive'
        };
    }

    if (tx.type === 'transfer') {
        if (tx.user === username) {
            return {
                typeLabel: `↗ Transfer ke ${tx.to}`,
                badgeClass: 'badge-transfer-out',
                amountText: '-' + formatCurrency(tx.amount),
                amountClass: 'amount-negative'
            };
        } else {
            return {
                typeLabel: `↙ Transfer dari ${tx.user}`,
                badgeClass: 'badge-transfer-in',
                amountText: '+' + formatCurrency(tx.amount),
                amountClass: 'amount-positive'
            };
        }
    }

    return {
        typeLabel: 'Lainnya',
        badgeClass: '',
        amountText: formatCurrency(tx.amount),
        amountClass: ''
    };
}

// ============================================
// MODUL: MODAL SUKSES
// ============================================

/**
 * Menampilkan modal sukses
 * @param {string} title - Judul modal
 * @param {string} message - Pesan modal
 */
function showSuccessModal(title, message) {
    document.getElementById('modal-success-title').textContent = title;
    document.getElementById('modal-success-message').textContent = message;
    document.getElementById('modal-success').style.display = 'flex';
}

/**
 * Menutup modal sukses dan kembali ke dashboard
 */
function closeSuccessModal() {
    document.getElementById('modal-success').style.display = 'none';
    loadDashboard();
    navigateTo('page-dashboard');
}

// ============================================
// MODUL: TOGGLE PASSWORD
// ============================================

/**
 * Toggle visibilitas password
 */
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    const eyeOpen = toggleBtn.querySelector('.eye-open');
    const eyeClosed = toggleBtn.querySelector('.eye-closed');

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Menginisialisasi semua event listener
 * Dijalankan setelah DOM selesai dimuat
 */
function initEventListeners() {

    // --- Form Login ---
    document.getElementById('form-login').addEventListener('submit', handleLogin);

    // --- Tombol Logout ---
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // --- Menu Dashboard ---
    document.getElementById('btn-menu-topup').addEventListener('click', () => {
        loadTopUpPage();
        navigateTo('page-topup');
    });

    document.getElementById('btn-menu-transfer').addEventListener('click', () => {
        loadTransferPage();
        navigateTo('page-transfer');
    });

    document.getElementById('btn-menu-history').addEventListener('click', () => {
        loadHistoryPage();
        navigateTo('page-history');
    });

    // --- Tombol Kembali ---
    document.getElementById('btn-back-topup').addEventListener('click', () => {
        loadDashboard();
        navigateTo('page-dashboard');
    });

    document.getElementById('btn-back-transfer').addEventListener('click', () => {
        loadDashboard();
        navigateTo('page-dashboard');
    });

    document.getElementById('btn-back-history').addEventListener('click', () => {
        loadDashboard();
        navigateTo('page-dashboard');
    });

    // --- Form Top Up ---
    document.getElementById('form-topup').addEventListener('submit', handleTopUp);

    // --- Form Transfer ---
    document.getElementById('form-transfer').addEventListener('submit', handleTransfer);

    // --- Quick Amount Buttons ---
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Hapus seleksi sebelumnya
            clearQuickAmountSelection();
            // Tandai tombol yang dipilih
            btn.classList.add('selected');
            // Isi input nominal
            document.getElementById('topup-amount').value = btn.dataset.amount;
        });
    });

    // --- Filter Riwayat ---
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update filter aktif
            currentFilter = btn.dataset.filter;
            // Update style tombol
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Render ulang tabel
            renderHistory();
        });
    });

    // --- Modal Sukses ---
    document.getElementById('btn-modal-ok').addEventListener('click', closeSuccessModal);

    // --- Klik Demo Account ---
    document.getElementById('demo-user1').addEventListener('click', () => {
        document.getElementById('login-username').value = 'user1';
        document.getElementById('login-password').value = '123456';
    });

    document.getElementById('demo-user2').addEventListener('click', () => {
        document.getElementById('login-username').value = 'user2';
        document.getElementById('login-password').value = '123456';
    });

    // --- Toggle Password ---
    setupPasswordToggle();
}

// ============================================
// CEK SESI LOGIN
// ============================================

/**
 * Mengecek apakah user masih dalam sesi login
 * Jika ya, langsung tampilkan dashboard
 */
function checkExistingSession() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        loadDashboard();
        navigateTo('page-dashboard');
    } else {
        navigateTo('page-login');
    }
}

// ============================================
// INISIALISASI APLIKASI
// ============================================

/**
 * Fungsi utama yang dijalankan saat DOM selesai dimuat
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 E-Wallet App dimulai...');

    // 1. Inisialisasi data default (jika belum ada)
    initializeDefaultData();

    // 2. Inisialisasi semua event listener
    initEventListeners();

    // 3. Cek sesi login yang masih aktif
    checkExistingSession();

    console.log('✅ Aplikasi siap digunakan');
    console.log('📝 Gunakan console untuk melihat log pengujian');
});
