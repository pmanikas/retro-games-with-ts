let score = 0;

export let updateScore = function(state) {
  if (state === "score") {
    score++;
  } else if (state === "zero") {
    score = 0;
  }
  document.getElementById("scoreValue").innerText = score;
};
