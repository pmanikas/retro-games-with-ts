export function showScreen(screen) {
  if(!screen) return;
  screen.classList.add('active');
}

export function hideScreen(screen) {
  if(!screen) return;
  screen.classList.remove('active');
}

export function getFocusedIndexFromNodes(nodes) {
    let focused = undefined;
    nodes.forEach((elem, i) => {
        if(document.activeElement === elem) focused = i;
    });
    return focused;
}

export function setElementText(element, text) {
  element.textContent = text;
}

export function setElementValue(element, value) {
  element.value = value;
}