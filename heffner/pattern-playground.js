(function () {
  var STORAGE_KEY = 'hfa-community-patterns-v1';
  var MAX_ITEMS = 36;
  var MAX_FILE_BYTES = 3 * 1024 * 1024;
  var supabaseClient = null;
  var supabaseCfg = null;

  function safeLoad() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (item) {
        return item && typeof item.src === 'string' && item.src.indexOf('data:image/') === 0;
      });
    } catch (e) {
      return [];
    }
  }

  function safeSave(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function getSupabaseClient() {
    if (supabaseClient !== null) return supabaseClient;
    var cfg = window.HFA_SUPABASE || {};
    if (!window.supabase || !cfg.url || !cfg.anonKey) {
      supabaseClient = null;
      return supabaseClient;
    }
    supabaseCfg = {
      bucket: cfg.bucket || 'patterns',
      table: cfg.table || 'community_patterns'
    };
    supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    return supabaseClient;
  }

  function normalizeItem(raw) {
    if (!raw) return null;
    var src = raw.image_url || raw.src;
    if (!src) return null;
    return {
      id: raw.id || null,
      src: src,
      createdAt: raw.created_at || raw.createdAt || Date.now(),
      author: raw.author_name || raw.author || '',
      message: raw.note || raw.message || ''
    };
  }

  function render(grid, items) {
    grid.innerHTML = '';
    if (!items.length) {
      var empty = document.createElement('div');
      empty.className = 'community-board-empty';
      empty.textContent = 'No community patterns yet. Upload the first one.';
      grid.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      var tile = document.createElement('div');
      tile.className = 'community-board-item';
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = 'Uploaded community pattern';
      img.loading = 'lazy';

      var meta = document.createElement('div');
      meta.className = 'community-board-meta';
      var by = document.createElement('div');
      by.className = 'community-board-meta-by';
      by.textContent = item.author ? 'By ' + item.author : 'By anonymous';
      meta.appendChild(by);
      if (item.message) {
        var note = document.createElement('div');
        note.className = 'community-board-meta-note';
        note.textContent = item.message;
        meta.appendChild(note);
      }

      tile.appendChild(img);
      tile.appendChild(meta);
      grid.appendChild(tile);
    });
  }

  function loadRemoteItems() {
    var client = getSupabaseClient();
    if (!client) return Promise.resolve([]);
    return client
      .from(supabaseCfg.table)
      .select('id,image_url,created_at,author_name,note')
      .order('created_at', { ascending: false })
      .limit(MAX_ITEMS)
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(normalizeItem).filter(Boolean);
      });
  }

  function addRemoteFile(file, author, message) {
    var client = getSupabaseClient();
    if (!client) return Promise.resolve(null);
    var extension = (file.name.split('.').pop() || 'png').toLowerCase();
    var path =
      'uploads/' +
      Date.now() +
      '-' +
      Math.random().toString(36).slice(2) +
      '.' +
      extension;
    var publicUrl = '';
    return client.storage
      .from(supabaseCfg.bucket)
      .upload(path, file, { upsert: false })
      .then(function (uploadRes) {
        if (uploadRes.error) throw uploadRes.error;
        publicUrl = client.storage.from(supabaseCfg.bucket).getPublicUrl(path).data.publicUrl;
        return client.from(supabaseCfg.table).insert({
          image_url: publicUrl,
          author_name: author || null,
          note: message || null
        });
      })
      .then(function (insertRes) {
        if (!insertRes.error) return;
        return client.from(supabaseCfg.table).insert({ image_url: publicUrl });
      })
      .catch(function () {
        return client.from(supabaseCfg.table).insert({ image_url: publicUrl });
      });
  }

  function readAsDataURL(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = function () {
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }

  function askMeta() {
    return {
      author: window.prompt('Your name (optional):', '') || '',
      message: window.prompt('Leave a short message (optional):', '') || ''
    };
  }

  function init() {
    var input = document.getElementById('community-pattern-upload');
    var grid = document.getElementById('community-board-grid');
    if (!input || !grid) return;
    var items = [];
    var useRemote = !!getSupabaseClient();

    function refreshBoard() {
      if (useRemote) {
        loadRemoteItems()
          .then(function (loaded) {
            items = loaded;
            render(grid, items);
          })
          .catch(function () {
            items = [];
            render(grid, items);
          });
      } else {
        items = safeLoad().map(normalizeItem).filter(Boolean);
        render(grid, items);
      }
    }

    refreshBoard();

    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) return;
      var imageFiles = files.filter(function (f) {
        return /^image\//.test(f.type || '') && f.size <= MAX_FILE_BYTES;
      });
      if (!imageFiles.length) {
        input.value = '';
        return;
      }
      var meta = askMeta();

      if (useRemote) {
        Promise.all(
          imageFiles.map(function (file) {
            return addRemoteFile(file, meta.author, meta.message);
          })
        )
          .then(function () {
            refreshBoard();
            input.value = '';
          })
          .catch(function () {
            alert('Upload failed. Check Supabase bucket/table policies.');
            input.value = '';
          });
        return;
      }

      Promise.all(
        imageFiles.map(function (file) {
          return readAsDataURL(file);
        })
      ).then(function (dataUrls) {
        dataUrls.forEach(function (src) {
          if (!src) return;
          items.unshift({
            src: src,
            createdAt: Date.now(),
            author: meta.author,
            message: meta.message
          });
        });
        items = items.slice(0, MAX_ITEMS);
        safeSave(items);
        render(grid, items);
        input.value = '';
      });
    });

    window.addEventListener('hfa:community-patterns-updated', refreshBoard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
