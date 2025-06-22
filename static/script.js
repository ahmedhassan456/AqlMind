class AqlMindApp {
  constructor() {
    this.sessionId = null
    this.isLoading = false
    this.initializeElements()
    this.bindEvents()
  }

  initializeElements() {
    this.elements = {
      apiKey: document.getElementById("apiKey"),
      websiteUrl: document.getElementById("websiteUrl"),
      loadUrlBtn: document.getElementById("loadUrlBtn"),
      clearChatBtn: document.getElementById("clearChatBtn"),
      welcomeMessage: document.getElementById("welcomeMessage"),
      chatMessages: document.getElementById("chatMessages"),
      chatInputContainer: document.getElementById("chatInputContainer"),
      chatInput: document.getElementById("chatInput"),
      sendBtn: document.getElementById("sendBtn"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      loadingText: document.getElementById("loadingText"),
      urlStatus: document.getElementById("urlStatus"),
      currentUrl: document.getElementById("currentUrl"),
      toastContainer: document.getElementById("toastContainer"),
    }
  }

  bindEvents() {
    this.elements.loadUrlBtn.addEventListener("click", () => this.loadUrl())
    this.elements.clearChatBtn.addEventListener("click", () => this.clearChat())
    this.elements.sendBtn.addEventListener("click", () => this.sendMessage())

    
    this.elements.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    
    this.elements.chatInput.addEventListener("input", (e) => {
      this.autoResizeTextarea(e.target)
      const hasText = this.elements.chatInput.value.trim().length > 0
      this.elements.sendBtn.disabled = !hasText || this.isLoading
    })
  }

  
  autoResizeTextarea(textarea) {
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"

    toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `

    this.elements.toastContainer.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 5000)
  }

  showLoading(text = "Processing...") {
    this.isLoading = true
    this.elements.loadingText.textContent = text
    this.elements.loadingOverlay.style.display = "flex"
    this.updateButtonStates()
  }

  hideLoading() {
    this.isLoading = false
    this.elements.loadingOverlay.style.display = "none"
    this.updateButtonStates()
  }

  updateButtonStates() {
    this.elements.loadUrlBtn.disabled = this.isLoading
    this.elements.sendBtn.disabled = this.isLoading || !this.elements.chatInput.value.trim()
    this.elements.chatInput.disabled = this.isLoading || !this.sessionId
  }

  async loadUrl() {
    const apiKey = this.elements.apiKey.value.trim()
    const url = this.elements.websiteUrl.value.trim()

    if (!apiKey || !url) {
      this.showToast("Please provide both API key and URL.", "error")
      return
    }

    this.showLoading("Fetching website content...")

    try {
      const response = await fetch("/api/load-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          url: url,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        this.sessionId = data.session_id
        this.elements.currentUrl.textContent = url
        this.showChatInterface()
        this.showToast("Website loaded successfully!", "success")
      } else {
        throw new Error(data.detail || "Failed to load URL")
      }
    } catch (error) {
      console.error("Error loading URL:", error)
      this.showToast(`Error: ${error.message}`, "error")
    } finally {
      this.hideLoading()
    }
  }

  showChatInterface() {
    this.elements.welcomeMessage.style.display = "none"
    this.elements.chatMessages.style.display = "block"
    this.elements.chatInputContainer.style.display = "block"
    this.elements.urlStatus.style.display = "flex"
    this.elements.clearChatBtn.style.display = "block"
    this.elements.chatInput.disabled = false

    this.addWelcomeMessage()

    this.updateButtonStates()
  }

  
  addWelcomeMessage() {
    const url = this.elements.currentUrl.textContent
    const welcomeText = `🎉 **Welcome!** I've successfully analyzed the content from **${url}**. 

I'm ready to help you understand and explore this website's content. You can ask me about:
• Main topics and themes
• Specific information or details
• Summaries of sections
• Explanations of complex content
• And much more!

What would you like to know about this website?`

    this.addMessage(welcomeText, "assistant")
  }

  hideChatInterface() {
    this.elements.welcomeMessage.style.display = "flex"
    this.elements.chatMessages.style.display = "none"
    this.elements.chatInputContainer.style.display = "none"
    this.elements.urlStatus.style.display = "none"
    this.elements.clearChatBtn.style.display = "none"
    this.elements.chatInput.disabled = true
    this.updateButtonStates()
  }

  clearChat() {
    if (!this.sessionId) return

    this.elements.chatMessages.innerHTML = ""
    this.showToast("Chat cleared!", "info")
  }

  addMessage(content, role) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${role}`

    const avatar = role === "user" ? "fa-user" : "fa-robot"

    messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatar}"></i>
            </div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `

    this.elements.chatMessages.appendChild(messageDiv)
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight
  }

  formatMessage(content) {
    return content
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
  }

  showTypingIndicator() {
    this.hideTypingIndicator()

    const typingDiv = document.createElement("div")
    typingDiv.className = "typing-indicator"
    typingDiv.id = "typingIndicator"

    typingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="typing-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span style="margin-left: 8px; color: #64748b; font-size: 0.9rem;">AI is thinking...</span>
      </div>
    `

    this.elements.chatMessages.appendChild(typingDiv)
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator")
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  async sendMessage() {
    const message = this.elements.chatInput.value.trim()
    if (!message || !this.sessionId || this.isLoading) return

    
    this.addMessage(message, "user")
    this.elements.chatInput.value = ""
    this.elements.chatInput.style.height = "auto"

    
    this.showTypingIndicator()
    this.isLoading = true
    this.updateButtonStates()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          message: message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        this.hideTypingIndicator()
        this.addMessage(data.response, "assistant")
      } else {
        throw new Error(data.detail || "Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      this.hideTypingIndicator()
      this.showToast(`Error: ${error.message}`, "error")
      this.addMessage("Sorry, I encountered an error processing your request. Please try again.", "assistant")
    } finally {
      this.isLoading = false
      this.updateButtonStates()
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  new AqlMindApp()
})
