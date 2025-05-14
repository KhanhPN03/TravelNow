require("dotenv").config();
const OpenAI = require("openai");
const faqResponses = require("../utils/faqResponses");

class ChatbotController {
  async Chat(req, res, next) {
    const token = process.env["GITHUB_TOKEN"];
    const endpoint = "https://models.inference.ai.azure.com";
    const modelName = "gpt-4o-mini";

    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Kiểm tra nếu câu hỏi là FAQ
      if (faqResponses[message]) {
        return res.status(200).json({ reply: faqResponses[message] });
      }

      // Lưu hội thoại trước vào session (có thể thay bằng database)
      req.session.history = req.session.history || [
        { role: "system", content: "You are a helpful assistant travel." }
      ];
      req.session.history.push({ role: "user", content: message });

      const client = new OpenAI({ baseURL: endpoint, apiKey: token });

      const response = await client.chat.completions.create({
        messages: req.session.history,
        model: modelName,
        temperature: 0.7,
        max_tokens: 8,
      });

      // Thêm phản hồi của bot vào lịch sử hội thoại
      req.session.history.push(response.choices[0].message);

      res.status(200).json({ reply: response.choices[0]?.message?.content || "Sorry, I do not understand your question." });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = new ChatbotController();
