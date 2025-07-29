document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const textInput = document.getElementById("textInput");
  const charCount = document.getElementById("charCount");
  const wordCount = document.getElementById("wordCount");
  const sentenceCount = document.getElementById("sentenceCount");
  const paragraphCount = document.getElementById("paragraphCount");
  const readingTime = document.getElementById("readingTime");
  const searchInput = document.getElementById("searchInput");
  const matchCount = document.getElementById("matchCount");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const warningSection = document.getElementById("warningSection");
  const warningText = document.getElementById("warningText");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const advancedToggle = document.getElementById("advancedToggle");
  const advancedContent = document.getElementById("advancedContent");
  const advancedIcon = document.getElementById("advancedIcon");

  // Buttons
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const highlightLongBtn = document.getElementById("highlightLongBtn");
  const uppercaseBtn = document.getElementById("uppercaseBtn");
  const lowercaseBtn = document.getElementById("lowercaseBtn");
  const sentenceCaseBtn = document.getElementById("sentenceCaseBtn");
  const titleCaseBtn = document.getElementById("titleCaseBtn");
  const splitTextBtn = document.getElementById("splitTextBtn");
  const addLineBreaksBtn = document.getElementById("addLineBreaksBtn");
  const spellCheckBtn = document.getElementById("spellCheckBtn");
  const readabilityBtn = document.getElementById("readabilityBtn");
  const vocabularyBtn = document.getElementById("vocabularyBtn");
  const ttsBtn = document.getElementById("ttsBtn");
  const stopTtsBtn = document.getElementById("stopTtsBtn");
  let isSpeaking = false;

  // Load saved text from localStorage
  const savedText = localStorage.getItem("wordMagicText");
  if (savedText) {
    textInput.value = savedText;
    updateStats();
  }

  // Event Listeners
  textInput.addEventListener("input", function () {
    updateStats();
    highlightSearch();
    checkYouTubeLimit();
    // Save to localStorage
    localStorage.setItem("wordMagicText", textInput.value);
  });

  searchInput.addEventListener("input", highlightSearch);
  clearSearchBtn.addEventListener("click", clearSearch);

  // Button Event Listeners
  copyBtn.addEventListener("click", copyToClipboard);
  clearBtn.addEventListener("click", clearText);
  downloadBtn.addEventListener("click", downloadText);
  highlightLongBtn.addEventListener("click", highlightLongWords);
  uppercaseBtn.addEventListener("click", () => convertCase("uppercase"));
  lowercaseBtn.addEventListener("click", () => convertCase("lowercase"));
  sentenceCaseBtn.addEventListener("click", () => convertCase("sentence"));
  titleCaseBtn.addEventListener("click", () => convertCase("title"));
  splitTextBtn.addEventListener("click", splitText);
  addLineBreaksBtn.addEventListener("click", addLineBreaks);
  spellCheckBtn.addEventListener("click", showSpellCheck);
  readabilityBtn.addEventListener("click", showReadability);
  vocabularyBtn.addEventListener("click", showVocabularyLevel);
  ttsBtn.addEventListener("click", textToSpeech);

  // Dark Mode Toggle
  darkModeToggle.addEventListener("click", toggleDarkMode);
  if (localStorage.getItem("darkMode") === "enabled") {
  }

  // Advanced Tools Toggle
  advancedToggle.addEventListener("click", toggleAdvancedTools);

  // Functions
  function updateStats() {
    const text = textInput.value;
    const charCountValue = text.length;
    const wordCountValue =
      text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentenceCountValue =
      text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphCountValue =
      text.trim() === ""
        ? 0
        : text.split(/\n+/).filter((p) => p.trim().length > 0).length;
    const readingTimeValue = Math.ceil(wordCountValue / 200); // Average reading speed: 200 words per minute

    charCount.textContent = charCountValue.toLocaleString();
    wordCount.textContent = wordCountValue.toLocaleString();
    sentenceCount.textContent = sentenceCountValue.toLocaleString();
    paragraphCount.textContent = paragraphCountValue.toLocaleString();
    readingTime.textContent = `${readingTimeValue} min`;
  }

  function highlightSearch() {
    const searchTerm = searchInput.value.trim();
    let text = textInput.value;

    // Remove previous highlights
    text = text.replace(/<span class="highlight">([^<]*)<\/span>/g, "$1");

    if (searchTerm === "") {
      matchCount.textContent = "0 matches";
      textInput.value = text;
      return;
    }

    try {
      const regex = new RegExp(searchTerm, "gi");
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      matchCount.textContent = `${count} match${count !== 1 ? "es" : ""}`;

      textInput.value = text.replace(
        regex,
        (match) => `<span class="highlight">${match}</span>`
      );
    } catch (e) {
      matchCount.textContent = "Invalid search";
    }
  }

  function clearSearch() {
    searchInput.value = "";
    highlightSearch();
  }

  function checkYouTubeLimit() {
    const charCount = textInput.value.length;
    if (charCount > 10000) {
      warningSection.classList.remove("hidden");
      warningText.textContent = `⚠️ Warning: YouTube comment limit exceeded (Max: 10,000 characters) - You have ${charCount.toLocaleString()}`;
    } else {
      warningSection.classList.add("hidden");
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(textInput.value.replace(/<[^>]*>?/gm, ""));
    showToast("Copied to clipboard!");
  }

  function clearText() {
    textInput.value = "";
    updateStats();
    clearSearch();
    showToast("Text cleared!");
  }

  function downloadText() {
    const text = textInput.value.replace(/<[^>]*>?/gm, "");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wordmagic-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Download started!");
  }

  function highlightLongWords() {
    let text = textInput.value.replace(
      /<span class="long-word">([^<]*)<\/span>/g,
      "$1"
    );
    const words = text.split(/\s+/);

    for (let word of words) {
      if (word.replace(/[^a-zA-Z]/g, "").length > 10) {
        const regex = new RegExp(`\\b${word}\\b`, "g");
        text = text.replace(regex, `<span class="long-word">${word}</span>`);
      }
    }

    textInput.value = text;
    showToast("Long words highlighted!");
  }

  function convertCase(caseType) {
    let text = textInput.value.replace(/<[^>]*>?/gm, "");

    switch (caseType) {
      case "uppercase":
        text = text.toUpperCase();
        break;
      case "lowercase":
        text = text.toLowerCase();
        break;
      case "sentence":
        text = text
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "title":
        text = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
        break;
    }

    textInput.value = text;
    showToast(
      `Converted to ${caseType.replace(/([A-Z])/g, " $1").toLowerCase()}!`
    );
  }

  function splitText() {
    const text = textInput.value.replace(/<[^>]*>?/gm, "");
    const chunkSize = 2000;
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    if (chunks.length > 1) {
      textInput.value = chunks.join("\n\n--- PART BREAK ---\n\n");
      showToast(`Split into ${chunks.length} parts!`);
    } else {
      showToast("Text is too short to split!");
    }
  }

  function addLineBreaks() {
    let text = textInput.value.replace(/<[^>]*>?/gm, "");
    const maxLength = 100;
    let result = "";

    while (text.length > 0) {
      let chunk = text.substring(0, maxLength);
      const lastSpace = chunk.lastIndexOf(" ");

      if (lastSpace > 0 && chunk.length === maxLength) {
        chunk = chunk.substring(0, lastSpace);
        text = text.substring(lastSpace + 1);
      } else {
        text = text.substring(chunk.length);
      }

      result += chunk + "\n";
    }

    textInput.value = result.trim();
    showToast("Line breaks added every ~100 characters!");
  }

  function showSpellCheck() {
    showToast("Spell check feature coming soon!");
  }

  function showReadability() {
    const text = textInput.value.replace(/<[^>]*>?/gm, "");
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentences =
      text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    const syllables = countSyllables(text);

    if (words === 0 || sentences === 0) {
      showToast("Not enough text to calculate readability!");
      return;
    }

    // Flesch-Kincaid Reading Ease
    const fkScore =
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    let level = "";

    if (fkScore >= 90) level = "Very Easy (5th grade)";
    else if (fkScore >= 80) level = "Easy (6th grade)";
    else if (fkScore >= 70) level = "Fairly Easy (7th grade)";
    else if (fkScore >= 60) level = "Standard (8th-9th grade)";
    else if (fkScore >= 50) level = "Fairly Difficult (10th-12th grade)";
    else if (fkScore >= 30) level = "Difficult (College)";
    else level = "Very Difficult (College graduate)";

    showToast(`Readability: ${Math.round(fkScore)} (${level})`);
  }

  function countSyllables(text) {
    text = text.toLowerCase();
    let count = 0;
    const words = text.split(/\s+/);

    for (let word of words) {
      word = word.replace(/'s$/, "").replace(/[^a-z]/g, "");
      if (word.length <= 3) {
        count += 1;
        continue;
      }

      word = word
        .replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, "")
        .replace(/^y/, "")
        .replace(/([aeiouy]{1,3})/g, "$1");

      count += word.length > 0 ? word.length : 1;
    }

    return count;
  }

  function showVocabularyLevel() {
    const text = textInput.value.replace(/<[^>]*>?/gm, "");
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    const commonWords = [
      "the",
      "and",
      "to",
      "of",
      "a",
      "in",
      "is",
      "it",
      "you",
      "that",
      "he",
      "was",
      "for",
      "on",
      "are",
      "with",
      "as",
      "I",
      "his",
      "they",
      "be",
      "at",
      "one",
      "have",
      "this",
      "from",
      "or",
      "had",
      "by",
      "not",
      "word",
      "but",
      "what",
      "some",
      "we",
      "can",
      "out",
      "other",
      "were",
      "all",
      "there",
      "when",
      "up",
      "use",
      "your",
      "how",
      "said",
      "an",
      "each",
      "she",
    ];

    const uncommonWords = uniqueWords.filter(
      (word) => word.length > 5 && !commonWords.includes(word)
    );

    const percentage =
      Math.round((uncommonWords.length / uniqueWords.length) * 100) || 0;
    let level = "";

    if (percentage < 10) level = "Basic";
    else if (percentage < 20) level = "Intermediate";
    else if (percentage < 30) level = "Advanced";
    else level = "Expert";

    showToast(`Vocabulary Level: ${level} (${percentage}% uncommon words)`);
  }

  function textToSpeech() {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        stopTtsBtn.classList.add("hidden");
        showToast("Speech stopped");
        return;
      }

      const speech = new SpeechSynthesisUtterance();
      speech.text = textInput.value.replace(/<[^>]*>?/gm, "");

      speech.onstart = function () {
        isSpeaking = true;
        stopTtsBtn.classList.remove("hidden");
        ttsBtn.innerHTML =
          '<i class="fas fa-volume-up mb-1"></i><span class="text-xs">Stop Speech</span>';
        showToast("Reading text aloud...");
      };

      speech.onend = function () {
        isSpeaking = false;
        stopTtsBtn.classList.add("hidden");
        ttsBtn.innerHTML =
          '<i class="fas fa-volume-up mb-1"></i><span class="text-xs">Text to Speech</span>';
      };

      window.speechSynthesis.speak(speech);
    } else {
      showToast("Text-to-speech not supported in your browser");
    }
  }

  stopTtsBtn.addEventListener("click", function () {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    stopTtsBtn.classList.add("hidden");
    ttsBtn.innerHTML =
      '<i class="fas fa-volume-up mb-1"></i><span class="text-xs">Text to Speech</span>';
    showToast("Speech stopped");
  });

  function toggleDarkMode() {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("darkMode", "enabled");
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> ';
    } else {
      localStorage.setItem("darkMode", "disabled");
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> ';
    }
  }

  function toggleAdvancedTools() {
    advancedContent.classList.toggle("hidden");
    advancedIcon.classList.toggle("rotate-180");
  }

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }

  // Tooltip functionality
  const toolButtons = document.querySelectorAll(".tool-btn");
  toolButtons.forEach((button) => {
    button.addEventListener("mouseover", function () {
      const tooltip = document.createElement("div");
      tooltip.className =
        "absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full mb-2 whitespace-nowrap";
      tooltip.textContent = this.querySelector("span").textContent;

      this.appendChild(tooltip);
      this.style.position = "relative";

      button.addEventListener("mouseout", function () {
        tooltip.remove();
      });
    });
  });
});
