(() => {
  const cfg = window.TH_CONFIG || {};
  const app = document.getElementById("app");
  const logoutBtn = document.getElementById("logoutBtn");
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const toEmail = input => {
    const value = input.trim().toLowerCase();
    return /^thr\d{6}$/i.test(value) ? value + "@students.therason.app" : value;
  };
  if (!cfg.url || cfg.url === "REPLACE_WITH_PROJECT_URL" || !cfg.key) {
    app.innerHTML = '<section class="card"><h1 class="title">THERASON</h1><p class="error">المنصة تحتاج إعداد رابط Supabase أولاً.</p></section>';
    return;
  }
  const client = window.supabase.createClient(cfg.url, cfg.key);
  const setLogout = show => logoutBtn.classList.toggle("hidden", !show);
  logoutBtn.addEventListener("click", async () => { await client.auth.signOut(); setLogout(false); renderLogin(); });
  const renderLogin = () => {
    setLogout(false);
    app.innerHTML = '<div class="welcome-layout"><section class="intro"><span class="eyebrow">منصة تعليمية لطلاب العلاج الطبيعي</span><h1>حيث يبدأ<br><em>التفكير السريري</em></h1><p>مساحة تعليمية تجمع المعرفة الطبية والتدريب العملي، وتساعدك على تطوير مهاراتك السريرية خطوة بخطوة.</p><div class="feature-row"><span class="feature"><i class="feature-icon">✦</i> تعلم تفاعلي</span><span class="feature"><i class="feature-icon">⌘</i> تفكير سريري</span><span class="feature"><i class="feature-icon">＋</i> نمو مهني</span></div></section><section class="card"><h1 class="title">مرحباً بك</h1><p class="muted">سجّل دخولك إلى بوابة THERASON التعليمية.</p><form id="loginForm"><div class="field"><label for="identity">الرقم التعريفي للطالب</label><input id="identity" autocomplete="username" required></div><div class="field"><label for="password">كلمة المرور</label><input id="password" type="password" autocomplete="current-password" required></div><p id="loginError" class="error hidden"></p><button class="btn" type="submit">دخول</button></form></section></div>';
    document.getElementById("loginForm").addEventListener("submit", login);
  };
  async function login(e){
    e.preventDefault();
    const identity = document.getElementById("identity").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("loginError");
    error.classList.add("hidden");
    const { error: authError } = await client.auth.signInWithPassword({email:toEmail(identity),password});
    if(authError){ error.textContent="تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى."; error.classList.remove("hidden"); return; }
    await loadAccount();
  }
  async function loadAccount(){
    app.innerHTML='<div class="loading">جارٍ تحميل حسابك…</div>';
    const {data:{user}}=await client.auth.getUser();
    if(!user){renderLogin();return;}
    const [{data:roles},{data:profile}] = await Promise.all([
      client.from("user_roles").select("role").eq("user_id",user.id),
      client.from("profiles").select("*").eq("user_id",user.id).maybeSingle()
    ]);
    const isSuper=(roles||[]).some(r=>r.role==="super_admin");
    if(isSuper){setLogout(true);renderAdmin();return;}
    if(profile){setLogout(true);renderStudent(profile);return;}
    setLogout(true);
    app.innerHTML='<section class="card"><h1 class="title">حسابك غير مفعّل</h1><p class="muted">تم تسجيل الدخول بنجاح، لكن الحساب لم يُفعّل داخل المنصة بعد.</p></section>';
  }
  async function renderStudent(profile){
    const {data:wallet}=await client.from("wallets").select("*").eq("user_id",profile.user_id).maybeSingle();
    const level=wallet?.level ?? 1, xp=wallet?.xp ?? 0, coins=wallet?.coins ?? 0;
    app.innerHTML='<section class="card"><h1 class="title">أهلاً '+escapeHtml(profile.display_name||profile.username||"بك")+'</h1><p class="muted">رحلتك في التفكير الإكلينيكي تبدأ هنا.</p><div class="stats"><div class="stat"><b>'+escapeHtml(level)+'</b>المستوى</div><div class="stat"><b>'+escapeHtml(xp)+'</b>XP</div><div class="stat"><b>'+escapeHtml(coins)+'</b>عملات</div></div></section>';
  }
  async function renderAdmin(){
    app.innerHTML='<section class="card"><h1 class="title">لوحة الإدارة</h1><div class="tabs"><button class="tab active" data-tab="institutions">الجامعات</button><button class="tab" data-tab="subjects">المواد</button></div><div id="adminContent"></div></section>';
    document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active"); b.dataset.tab==="institutions"?showInstitutions():showSubjects();}));
    showInstitutions();
  }
  async function showInstitutions(){
    const box=document.getElementById("adminContent"); box.innerHTML='<div class="loading">جارٍ التحميل…</div>';
    const {data,error}=await client.from("institutions").select("id,code,name_ar").order("code");
    if(error){box.innerHTML='<p class="error">تعذر تحميل البيانات.</p>';return;}
    box.innerHTML='<div class="list">'+(data||[]).map(x=>'<div class="item">'+escapeHtml(x.code)+' — '+escapeHtml(x.name_ar)+'</div>').join("")+'</div><form id="addInstitution"><div class="row"><div class="field"><label>الكود</label><input id="instCode" pattern="\\d{2}" maxlength="2" required></div><div class="field"><label>اسم الجامعة</label><input id="instName" required></div></div><button class="btn" type="submit">إضافة جامعة</button><p class="error hidden" id="instError"></p></form>';
    document.getElementById("addInstitution").addEventListener("submit",async e=>{e.preventDefault();const {error}=await client.from("institutions").insert({code:document.getElementById("instCode").value,name_ar:document.getElementById("instName").value.trim()});if(error){document.getElementById("instError").textContent="تعذر إضافة الجامعة.";document.getElementById("instError").classList.remove("hidden");return;}showInstitutions();});
  }
  async function showSubjects(){
    const box=document.getElementById("adminContent"); box.innerHTML='<div class="loading">جارٍ التحميل…</div>';
    const [{data:subjects},{data:specialties}]=await Promise.all([client.from("subjects").select("*").order("name_ar"),client.from("specialties").select("id,name_ar")]);
    box.innerHTML='<div class="list">'+(subjects||[]).map(x=>'<div class="item">'+escapeHtml(x.name_ar||x.name||"—")+'</div>').join("")+'</div><form id="addSubject"><div class="field"><label>اسم المادة</label><input id="subjectName" required></div><div class="field"><label>التخصص</label><select id="specialtyId" required><option value="">اختر</option>'+(specialties||[]).map(x=>'<option value="'+escapeHtml(x.id)+'">'+escapeHtml(x.name_ar)+'</option>').join("")+'</select></div><div class="field"><label>السنة</label><input id="subjectYear" type="number" min="1" required></div><button class="btn" type="submit">إضافة مادة</button><p class="error hidden" id="subjectError"></p></form>';
    document.getElementById("addSubject").addEventListener("submit",async e=>{e.preventDefault();const payload={name_ar:document.getElementById("subjectName").value.trim(),specialty_id:document.getElementById("specialtyId").value,year:Number(document.getElementById("subjectYear").value)};const {error}=await client.from("subjects").insert(payload);if(error){document.getElementById("subjectError").textContent="تعذر إضافة المادة. تحقق من الصلاحيات وبنية الجدول.";document.getElementById("subjectError").classList.remove("hidden");return;}showSubjects();});
  }
  client.auth.getSession().then(({data})=>data.session?loadAccount():renderLogin());
})();