(function () {
  const copy = document.querySelector(".pop-copy");
  if (!copy) return;

  const heading = copy.querySelector(".pop-heading");
  const angleDeg = (Math.random() * 8 - 4).toFixed(2);
  const x = (Math.random() * 12 - 6).toFixed(1);
  const y = (Math.random() * 8 - 4).toFixed(1);

  if (heading) {
    heading.style.transform = `translate(${x}px, ${y}px) rotate(${angleDeg}deg)`;
    return;
  }

  const title = copy.querySelector("h1");
  const catalog = copy.querySelector("h2");
  if (title) {
    title.style.transform = `translate(${x}px, ${y}px) rotate(${angleDeg}deg)`;
  }
  if (catalog) {
    catalog.style.transform = `translate(${x}px, ${y}px) rotate(${angleDeg}deg)`;
  }
})();
