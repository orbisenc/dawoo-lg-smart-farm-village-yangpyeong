const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-consult-form]");
const message = document.querySelector("[data-form-message]");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
  }
});

const pageSections = [...document.querySelectorAll("main > section, .footer")];
let isPageScrolling = false;
let wheelDelta = 0;
let wheelResetTimer;

function getCurrentSectionIndex() {
  const headerOffset = 76;
  const currentPosition = window.scrollY + headerOffset;

  return pageSections.reduce(
    (currentIndex, section, index) =>
      section.offsetTop <= currentPosition ? index : currentIndex,
    0
  );
}

window.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey) return;

    event.preventDefault();
    if (isPageScrolling) return;

    wheelDelta += event.deltaY;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelDelta = 0;
    }, 160);

    if (Math.abs(wheelDelta) < 24) return;

    const direction = Math.sign(wheelDelta);
    wheelDelta = 0;
    const currentIndex = getCurrentSectionIndex();
    const currentSection = pageSections[currentIndex];
    const headerOffset = 76;
    const sectionTop = Math.max(0, currentSection.offsetTop - headerOffset);
    const sectionBottom = Math.max(
      sectionTop,
      currentSection.offsetTop + currentSection.offsetHeight - window.innerHeight
    );
    const isTallSection = currentSection.offsetHeight > window.innerHeight + headerOffset;

    if (isTallSection) {
      const canMoveDownInside = direction > 0 && window.scrollY < sectionBottom - 8;
      const canMoveUpInside = direction < 0 && window.scrollY > sectionTop + 8;

      if (canMoveDownInside || canMoveUpInside) {
        const pageDistance = Math.max(320, window.innerHeight - headerOffset);
        const targetTop = direction > 0
          ? Math.min(sectionBottom, window.scrollY + pageDistance)
          : Math.max(sectionTop, window.scrollY - pageDistance);

        isPageScrolling = true;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        window.setTimeout(() => {
          isPageScrolling = false;
        }, 900);
        return;
      }
    }

    const targetIndex = Math.min(
      pageSections.length - 1,
      Math.max(0, currentIndex + direction)
    );

    if (targetIndex === currentIndex) return;

    isPageScrolling = true;
    const targetTop = Math.max(0, pageSections[targetIndex].offsetTop - headerOffset);
    window.scrollTo({ top: targetTop, behavior: "smooth" });

    window.setTimeout(() => {
      isPageScrolling = false;
    }, 900);
  },
  { passive: false }
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const lead = {
    name: data.get("name"),
    phone: data.get("phone"),
    region: data.get("region"),
    consultTime: data.get("consultTime"),
    interests: data.getAll("interest"),
    createdAt: new Date().toISOString(),
  };

  const leads = JSON.parse(localStorage.getItem("dawooFarmConsultLeads") || "[]");
  leads.unshift(lead);
  localStorage.setItem("dawooFarmConsultLeads", JSON.stringify(leads));

  form.reset();
  message.textContent = "상담 신청 정보가 임시 저장되었습니다. 추후 관리자 화면과 연동됩니다.";
});
