const fs = require("fs");

const CENSOR = 0;
const DONT_SEND_MESSAGE = 1;

class Filter {
  constructor(action) {
    if (![CENSOR, DONT_SEND_MESSAGE].includes(action)) {
      throw new Error(
        "Action must be either " +
          CENSOR +
          " for Censor the message or " +
          DONT_SEND_MESSAGE +
          " for Do not send the message"
      );
    }

    this.action = action;
    this.censors = [];
    this.fillCensors();
  }

  async fillCensors() {
    try {
      const data = await fs.promises.readFile("filtered-words.txt", "utf-8");
      this.censors = data.split(",");
    } catch (err) {
      console.error(err);
      this.censors = [];
    }
  }

  filter(text) {
    const lowerCaseText = text.toLowerCase();

    for (const word of this.censors) {
      if (lowerCaseText.includes(word.toLowerCase())) {
        if (this.action === CENSOR) {
          const censoredWord = "*".repeat(word.length);
          const regex = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
          text = text.replace(regex, censoredWord);
        } else if (this.action === DONT_SEND_MESSAGE) {
          return "<Message Deleted>";
        }
      }
    }

    return text;
  }
}

module.exports = Filter;