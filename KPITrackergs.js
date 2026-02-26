/**
 * File: d:\ME\Project\KPI Tracker\Code.gs
 */

function doGet() {
  return HtmlService.createTemplateFromFile('kpi-tracker')
      .evaluate()
      .setTitle('KPI Tracker')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function saveKPIData(data, kpiPeriod) {
  try {
    // ID Spreadsheet sesuai permintaan
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("KPI Data");
    var headers = ["Timestamp", "ID", "KPI Periode", "PERSPEKTIF", "Perspective Order", "TARGET", "STRATEGY", "ACTIVITY PLAN", "PIC", "TIMELINE (JSON)", "LINK SHEET"];
    
    // Buat sheet baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet("KPI Data");
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }

    var otherPeriodsData = [];
    // Jika sheet sudah ada dan berisi data, baca dan filter data dari periode lain
    if (sheet.getLastRow() > 1) {
      var allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
      otherPeriodsData = allData.filter(function(row) {
        // Simpan baris yang BUKAN dari kpiPeriod saat ini
        return String(row[2]) !== String(kpiPeriod);
      });
    }
    
    // Siapkan data baru dari frontend untuk periode saat ini
    var newPeriodData = [];
    if (data && data.length > 0) {
      var timestamp = new Date();
      newPeriodData = data.map(function(item) {
        return [
          timestamp,
          item.id,
          kpiPeriod || "2026",
          item.perspective,
          item.perspectiveOrder,
          item.target,
          item.strategy,
          item.activity,
          item.pic,
          JSON.stringify(item.timeline), // Simpan timeline sebagai JSON string agar mudah diparsing kembali
          item.sheetLink
        ];
      });
    }

    // Gabungkan data dari periode lain dengan data baru
    var combinedDataToWrite = otherPeriodsData.concat(newPeriodData);

    // Bersihkan konten sheet (mulai dari baris 2)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
    }

    // Tulis kembali data gabungan ke sheet
    if (combinedDataToWrite.length > 0) {
      sheet.getRange(2, 1, combinedDataToWrite.length, headers.length).setValues(combinedDataToWrite);
    }
    
    return { success: true };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getKPIData(kpiPeriod) {
  try {
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("KPI Data");
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, data: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var result = [];
    
    // Loop data mulai baris 2 (index 1) karena baris 1 adalah header
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Filter berdasarkan periode (Kolom C / Index 2)
      if (kpiPeriod && String(row[2]) !== String(kpiPeriod)) {
        continue;
      }
      
      var timeline = [];
      try {
        timeline = JSON.parse(row[9]); // Kolom J / Index 9 (TIMELINE JSON)
      } catch (e) {
        timeline = new Array(12).fill('');
      }
      
      result.push({
        id: Number(row[1]), // ID
        perspective: row[3], // PERSPEKTIF
        perspectiveOrder: Number(row[4]), // Order
        target: row[5], // TARGET
        strategy: row[6], // STRATEGY
        activity: row[7], // ACTIVITY PLAN
        pic: row[8], // PIC
        timeline: timeline,
        sheetLink: row[10] // LINK SHEET
      });
    }
    
    return { success: true, data: result };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function checkLogin(username, password) {
  try {
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("Users");
    
    if (!sheet) {
      return { success: false, error: "Sheet 'Users' tidak ditemukan. Harap buat sheet bernama 'Users' terlebih dahulu." };
    }
    
    var data = sheet.getDataRange().getValues();
    
    // Loop mulai baris ke-2 (index 1) karena baris 1 adalah header
    for (var i = 1; i < data.length; i++) {
      // Kolom A (0) = Username, Kolom B (1) = Password
      if (String(data[i][0]) === String(username) && String(data[i][1]) === String(password)) {
        
        var fullName = data[i][2]; // Kolom C
        var rawUrl = data[i][3];   // Kolom D
        var photoUrl = rawUrl;

        // Jika link adalah Google Drive, ubah ke format thumbnail agar bisa tampil
        if (rawUrl && rawUrl.toString().indexOf("drive.google.com") !== -1) {
          var fileIdMatch = rawUrl.match(/[-\w]{25,}/);
          if (fileIdMatch) photoUrl = "https://drive.google.com/thumbnail?sz=w100&id=" + fileIdMatch[0];
        }

        return { success: true, fullName: fullName, photoUrl: photoUrl };
      }
    }
    
    return { success: false, error: "Username atau Password salah." };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * PENTING: Jalankan fungsi ini SEKALI secara manual di editor script (klik Run)
 * untuk memicu dialog permintaan izin akses Google Drive.
 */
function authorizeScript() {
  DriveApp.getRootFolder(); // Baris ini akan memicu permintaan izin
  console.log("Akses Drive berhasil diberikan.");
}

/**
 * Mengunggah gambar dalam format Base64 ke folder Google Drive dan mengembalikannya sebagai URL publik.
 * @param {string} base64Data String Base64 dari gambar (misal: "data:image/png;base64,iVBORw0KGgo...").
 * @param {string} pic Nama PIC untuk penamaan file.
 * @returns {string} URL publik gambar atau pesan error.
 */
function uploadImage(base64Data, pic) {
  try {
    if (!base64Data) {
      console.log("Data gambar kosong atau undefined. Upload dibatalkan.");
      return "";
    }
    console.log("Memulai proses upload gambar untuk PIC: " + pic); // Log awal
    var FOLDER_NAME = "KPI_Tracker_Images";
    var folder;
    
    // Cek apakah folder sudah ada
    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    while (folders.hasNext()) {
      var f = folders.next();
      if (!f.isTrashed()) {
        folder = f;
        break;
      }
    }
    
    if (!folder) {
      console.log("Folder '" + FOLDER_NAME + "' tidak ditemukan. Membuat folder baru...");
      // Jika belum ada, buat folder baru dan set akses publik (Viewer)
      folder = DriveApp.createFolder(FOLDER_NAME);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
    console.log("Folder siap digunakan. ID: " + folder.getId());

    var data = base64Data.split(',');
    var contentType = data[0].match(/:(.*?);/)[1];
    var bytes = Utilities.base64Decode(data[1]);
    var blob = Utilities.newBlob(bytes, contentType, `kpi_img_${pic}_${new Date().getTime()}.png`);
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // Paksa izin publik pada file
    console.log("File berhasil dibuat di Drive. ID: " + file.getId());
    
    // Gunakan URL thumbnail agar lebih stabil ditampilkan di tag <img>
    return "https://drive.google.com/thumbnail?sz=w1000&id=" + file.getId();

  } catch (e) {
    console.error("ERROR Upload Image: " + e.toString()); // Log error merah di console
    Logger.log("Error uploading image: " + e.toString());
    if (e.toString().indexOf("permission") !== -1) {
      return "Error: Izin Drive belum aktif di versi ini. Lakukan Deploy > New Deployment.";
    }
    return "Error: Gagal mengunggah gambar. Cek log server.";
  }
}

/**
 * Mengunggah logo perusahaan dalam format Base64 ke folder Google Drive.
 * @param {string} base64Data String Base64 dari gambar.
 * @returns {string} URL publik gambar atau pesan error.
 */
function uploadCompanyLogo(base64Data) {
  try {
    var FOLDER_NAME = "KPI_Tracker_Logos"; // Folder khusus untuk logo
    var folder;
    
    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    var data = base64Data.split(',');
    var contentType = data[0].match(/:(.*?);/)[1];
    var bytes = Utilities.base64Decode(data[1]);
    var blob = Utilities.newBlob(bytes, contentType, `company_logo_${new Date().getTime()}.png`);
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // Paksa izin publik pada file
    return "https://drive.google.com/thumbnail?sz=w1000&id=" + file.getId();
  } catch (e) {
    console.error("ERROR Upload Company Logo: " + e.toString());
    return "Error: Gagal mengunggah logo.";
  }
}

/**
 * Menghapus file dari Google Drive (pindah ke Trash) berdasarkan URL publik.
 * @param {string} fileUrl URL file Google Drive (format: https://drive.google.com/uc?id=...).
 */
function deleteDriveFile(fileUrl) {
  try {
    if (!fileUrl) return { success: false };
    
    var idMatch = fileUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      var fileId = idMatch[1];
      DriveApp.getFileById(fileId).setTrashed(true);
      return { success: true };
    }
    return { success: false, error: "ID File tidak ditemukan" };
  } catch (e) {
    console.error("Error deleting file: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function saveCompanySettings(settings) {
  try {
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("Settings");
    
    if (!sheet) {
      sheet = ss.insertSheet("Settings");
    }
    
    // --- NEW LOGIC for image upload ---
    if (settings.logoUrl && settings.logoUrl.startsWith('data:image')) {
        var newLogoUrl = uploadCompanyLogo(settings.logoUrl);
        // Jika upload berhasil, gunakan URL baru. Jika tidak, jangan ubah logo.
        if (!newLogoUrl.startsWith('Error')) {
            settings.logoUrl = newLogoUrl;
        } else {
            // Hapus properti logoUrl agar tidak menyimpan base64 string yang error
            // dan tidak menimpa URL lama yang valid.
            delete settings.logoUrl; 
        }
    }

    // Ambil data yang ada di sheet dulu
    var existingSettings = {};
    if (sheet.getLastRow() > 1) {
        var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
        data.forEach(function(row) { existingSettings[row[0]] = row[1]; });
    }

    // Gabungkan setting lama dan baru (setting baru akan menimpa yang lama)
    var finalSettings = { ...existingSettings, ...settings };

    // Hapus konten lama dan tulis ulang data gabungan
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
    }
    
    var rowsToWrite = Object.keys(finalSettings).map(key => [key, finalSettings[key]]);

    if (rowsToWrite.length > 0) {
      sheet.getRange(2, 1, rowsToWrite.length, 2).setValues(rowsToWrite);
    }
    
    return { success: true, message: "Pengaturan perusahaan berhasil disimpan.", newSettings: finalSettings };
  } catch (e) {
    console.error("Error saveCompanySettings: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function getCompanySettings() {
  try {
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("Settings");
    
    if (!sheet || sheet.getLastRow() < 2) return { success: true, settings: {} };
    
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    var settings = {};
    data.forEach(function(row) { settings[row[0]] = row[1]; });
    
    return { success: true, settings: settings };
  } catch (e) {
    console.error("Error getCompanySettings: " + e.toString());
    return { success: false, error: e.toString(), settings: {} };
  }
}

function saveAnalysisData(data, kpiPeriod) {
  try {
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("Analysis Data");
    var headers = ["Timestamp", "ID", "KPI Periode", "PERSPEKTIF", "MASALAH", "ANALISA", "PERBAIKAN", "BEFORE", "AFTER", "PIC", "DUE DATE", "PROGRESS", "TANGGAL"];
    
    if (!sheet) {
      sheet = ss.insertSheet("Analysis Data");
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }

    var otherPeriodsData = [];
    if (sheet.getLastRow() > 1) {
      var allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
      otherPeriodsData = allData.filter(function(row) {
        return String(row[2]) !== String(kpiPeriod);
      });
    }
    
    var newPeriodData = [];
    var newPeriodDataForSheet = [];
    if (data && data.length > 0) {
      var timestamp = new Date();
      newPeriodData = data.map(function(item) {
        var beforeUrl = item.before;
        // Cek jika data 'before' adalah string base64, lalu unggah
        if (item.before && item.before.startsWith('data:image')) {
            beforeUrl = uploadImage(item.before, item.pic);
        }

        var afterUrl = item.after;
        // Cek jika data 'after' adalah string base64, lalu unggah
        if (item.after && item.after.startsWith('data:image')) {
            afterUrl = uploadImage(item.after, item.pic);
        }

        newPeriodDataForSheet.push([
          timestamp,
          item.id,
          kpiPeriod || "2026",
          item.perspective,
          item.problem,
          item.analysis,
          item.improvement,
          beforeUrl,
          afterUrl,
          item.pic,
          item.dueDate,
          item.progress,
          item.date
        ]);

        // Buat objek baru untuk dikirim kembali ke client dengan URL yang sudah diperbarui
        var updatedItem = JSON.parse(JSON.stringify(item));
        updatedItem.before = beforeUrl;
        updatedItem.after = afterUrl;
        return updatedItem;
      });
    }

    var combinedDataToWrite = otherPeriodsData.concat(newPeriodDataForSheet);

    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
    }

    if (combinedDataToWrite.length > 0) {
      sheet.getRange(2, 1, combinedDataToWrite.length, headers.length).setValues(combinedDataToWrite);
    }
    
    // BARU: Kembalikan data yang sudah diproses dengan URL Drive ke frontend
    return { success: true, data: newPeriodData };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getAnalysisData(kpiPeriod) {
  try {
    var ss = SpreadsheetApp.openById("1I4qIeu_pxGWX5uaDquQ0Tb1zIEBgGDSoXTlOuSl7lEA");
    var sheet = ss.getSheetByName("Analysis Data");
    
    if (!sheet || sheet.getLastRow() < 2) return { success: true, data: [] };
    
    var data = sheet.getDataRange().getValues();
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (kpiPeriod && String(row[2]) !== String(kpiPeriod)) continue;
      
      var dueDate = row[10];
      if (dueDate instanceof Date) dueDate = Utilities.formatDate(dueDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      
      var date = row[12];
      if (date instanceof Date) date = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
      
      // Fix URL gambar lama (uc?id=) menjadi format thumbnail agar tampil di aplikasi
      var beforeUrl = row[7];
      if (beforeUrl && beforeUrl.toString().indexOf("drive.google.com/uc") !== -1) {
         var idMatch = beforeUrl.match(/id=([-\w]+)/);
         if (idMatch) beforeUrl = "https://drive.google.com/thumbnail?sz=w1000&id=" + idMatch[1];
      }

      var afterUrl = row[8];
      if (afterUrl && afterUrl.toString().indexOf("drive.google.com/uc") !== -1) {
         var idMatch = afterUrl.match(/id=([-\w]+)/);
         if (idMatch) afterUrl = "https://drive.google.com/thumbnail?sz=w1000&id=" + idMatch[1];
      }

      result.push({ id: Number(row[1]), perspective: row[3], problem: row[4], analysis: row[5], improvement: row[6], before: beforeUrl, after: afterUrl, pic: row[9], dueDate: dueDate, progress: Number(row[11]), date: date });
    }
    return { success: true, data: result };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function saveAllData(activities, analysis, kpiPeriod) {
  var r1 = saveKPIData(activities, kpiPeriod);
  if (!r1.success) return r1;
  return saveAnalysisData(analysis, kpiPeriod);
}

function getAllData(kpiPeriod) {
  var r1 = getKPIData(kpiPeriod);
  var r2 = getAnalysisData(kpiPeriod);
  var r3 = getCompanySettings();
  return { 
    success: r1.success && r2.success && r3.success, 
    activities: r1.data || [], 
    analysis: r2.data || [], 
    settings: r3.settings || {},
    error: r1.error || r2.error || r3.error 
  };
}
