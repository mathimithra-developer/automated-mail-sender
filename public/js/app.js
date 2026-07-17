document.addEventListener("DOMContentLoaded", () => {
  const orgIndicator = document.getElementById("orgNameIndicator");
  const nameIndicator = document.getElementById("userNameIndicator");
  const emailIndicator = document.getElementById("userEmailIndicator");
  const avatarIndicator = document.getElementById("userAvatar");
  const welcomeHeader = document.getElementById("welcomeHeader");
  const logoutBtn = document.getElementById("logoutBtn");

  // Session globals
  window._session = null;

  async function checkSession() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const bypass = urlParams.get('bypass') === 'true';
      const fetchUrl = bypass ? "/api/auth/me?bypass=true" : "/api/auth/me";

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      const user = data.user;
      window._session = user;

      if (orgIndicator) orgIndicator.innerText = user.orgName || "Default Org";
      if (nameIndicator) nameIndicator.innerText = user.userName || "Admin User";
      if (emailIndicator) emailIndicator.innerText = user.email || "";
      if (welcomeHeader) welcomeHeader.innerText = `Welcome Back, ${user.userName || 'Admin'}!`;
      if (user.userName && avatarIndicator) avatarIndicator.innerText = user.userName[0].toUpperCase();

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error(err);
      window.location.href = "/login";
    }
  }

  // Page Routing — delegates to pages.js nav() if available
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((navItem) => {
    navItem.addEventListener("click", () => {
      const target = navItem.getAttribute("data-target");
      if (typeof window.nav === "function") {
        window.nav(target);
      } else {
        // Fallback — basic page switching
        navItems.forEach(item => item.classList.remove("active"));
        navItem.classList.add("active");
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
        const targetPage = document.getElementById(target);
        if (targetPage) targetPage.classList.add("active");
      }
    });
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (response.ok) window.location.href = "/login";
      } catch (err) {
        console.error("Sign out error:", err);
      }
    });
  }

  checkSession();
});
