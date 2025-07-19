// ===== CHAT INTERFACE FOR LEGAL AI ANALYZER =====

document.addEventListener("DOMContentLoaded", function () {
  initializeChat();
  initializeSuggestionPills();
});

// ===== CHAT INITIALIZATION =====
function initializeChat() {
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatMessages = document.getElementById("chat-messages");

  if (!chatForm || !chatInput || !chatSendBtn || !chatMessages) {
    return;
  }

  // Form submission
  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage();
  });

  // Auto-resize textarea
  chatInput.addEventListener("input", function () {
    autoResizeTextarea(this);
  });

  // Enter key to send (Shift+Enter for new line)
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Suggested questions are now handled by pills

  // Scroll to bottom initially
  scrollToBottom();
}

// ===== SUGGESTED QUESTIONS (Legacy - replaced by pills) =====
// This section is now handled by initializeSuggestionPills()

function sendSuggestedQuestion(question) {
  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.value = question;
    sendMessage();
  }
}

// ===== MESSAGE SENDING =====
function sendMessage() {
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const message = chatInput.value.trim();

  if (!message) {
    return;
  }

  // Disable input while sending
  chatInput.disabled = true;
  chatSendBtn.disabled = true;

  // Add user message to chat
  addMessage("user", message);

  // Clear input
  chatInput.value = "";
  autoResizeTextarea(chatInput);

  // Show typing indicator
  showTypingIndicator();

  // Send to API
  sendToAPI(message)
    .then((response) => {
      hideTypingIndicator();
      addMessage("ai", response.message);
    })
    .catch((error) => {
      hideTypingIndicator();
      addMessage(
        "ai",
        "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại."
      );
      console.error("Chat error:", error);
    })
    .finally(() => {
      // Re-enable input
      chatInput.disabled = false;
      chatSendBtn.disabled = false;
      chatInput.focus();
    });
}

function sendToAPI(message) {
  // Get report ID from URL or data attribute
  const reportId = getReportId();

  return fetch("/chat/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      report_id: reportId,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Chat API request failed");
    }
    return response.json();
  });
}

function getReportId() {
  // Extract report ID from URL path like /report/123
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

// ===== MESSAGE DISPLAY =====
function addMessage(sender, content) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  const currentTime = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.className = `message message-${sender}`;
  messageDiv.innerHTML = `
        <div class="message-bubble">${formatMessageContent(content)}</div>
        <div class="message-time">${currentTime}</div>
    `;

  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function formatMessageContent(content) {
  // Basic formatting for AI responses
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function showTypingIndicator() {
  const chatMessages = document.getElementById("chat-messages");
  const typingDiv = document.createElement("div");

  typingDiv.id = "typing-indicator";
  typingDiv.className = "message message-ai";
  typingDiv.innerHTML = `
        <div class="message-bubble">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

  chatMessages.appendChild(typingDiv);
  scrollToBottom();

  // Add CSS for typing animation if not already added
  addTypingCSS();
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function addTypingCSS() {
  if (document.getElementById("typing-css")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "typing-css";
  style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .typing-dots span {
            width: 6px;
            height: 6px;
            background-color: var(--primary-500);
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dots span:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .typing-dots span:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;

  document.head.appendChild(style);
}

// ===== UTILITY FUNCTIONS =====
function scrollToBottom() {
  const chatMessages = document.getElementById("chat-messages");
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

// ===== SAMPLE AI RESPONSES =====
// This would be replaced with actual API integration
const sampleResponses = {
  "rủi ro pháp lý":
    "Dựa trên phân tích hợp đồng, tôi đã xác định được 3 rủi ro pháp lý chính: (1) **Rủi ro cao**: Mức phí phạt 5%/ngày vượt quá quy định pháp luật, có thể bị tòa án tuyên bố vô hiệu. (2) **Rủi ro trung bình**: Điều khoản chấm dứt đơn phương thiếu căn cứ pháp lý rõ ràng. (3) **Rủi ro thấp**: Phân chia trách nhiệm bảo trì chưa chi tiết. Khuyến nghị ưu tiên đàm phán lại điều khoản phí phạt trước.",

  "tuân thủ pháp luật":
    "Hợp đồng này có một số điểm chưa tuân thủ đầy đủ quy định pháp luật: **Vi phạm Nghị định 15/2015/NĐ-CP** về mức phí phạt tối đa. **Chưa tuân thủ Luật Nhà ở 2014** về thời hạn thông báo chấm dứt hợp đồng. **Thiếu quy định** về giải quyết tranh chấp theo Luật Trọng tài thương mại. Tỷ lệ tuân thủ tổng thể: **72%**. Cần bổ sung và điều chỉnh để đảm bảo tính pháp lý.",

  "điều khoản bất lợi":
    "Tôi đã xác định 4 điều khoản bất cân xứng gây bất lợi: **(1) Phí phạt quá cao** - 5%/ngày so với mức tối đa 0.05%/ngày theo quy định. **(2) Quyền chấm dứt đơn phương** - Chỉ có lợi cho một bên. **(3) Trách nhiệm bảo trì** - Đẩy toàn bộ chi phí cho người thuê. **(4) Điều kiện hoàn cọc** - Quá khắt khe và mơ hồ. **Đề xuất**: Đàm phán giảm phí phạt xuống 0.05%/ngày, bổ sung điều kiện chấm dứt hợp đồng hợp lý.",

  "chấm dứt":
    "Phân tích điều khoản chấm dứt hợp đồng: **Thời hạn thông báo**: 15 ngày (không đủ theo Luật Nhà ở - tối thiểu 30 ngày). **Lý do chấm dứt**: Quá rộng, thiếu tính cụ thể. **Hậu quả vi phạm**: Mất toàn bộ tiền cọc + phí phạt cao. **Rủi ro pháp lý**: Cao - có thể bị tòa án tuyên bố một phần điều khoản vô hiệu. **Khuyến nghị**: Yêu cầu thời hạn thông báo 30 ngày, quy định rõ lý do chấm dứt hợp lý, giới hạn mức phạt theo quy định pháp luật.",

  "đề xuất cải thiện":
    "**Đề xuất 5 điều chỉnh ưu tiên để cải thiện hợp đồng**: **(1) Giảm phí phạt** từ 5%/ngày xuống 0.05%/ngày theo Nghị định 15/2015. **(2) Tăng thời hạn thông báo** chấm dứt từ 15 lên 30 ngày. **(3) Bổ sung điều khoản** phân chia rõ trách nhiệm bảo trì. **(4) Quy định cụ thể** điều kiện hoàn trả tiền cọc. **(5) Thêm cơ chế** giải quyết tranh chấp qua hòa giải trước khi ra tòa. Những điều chỉnh này sẽ giảm rủi ro pháp lý từ 75% xuống còn 25%.",
};

// Mock API response for development
function getMockResponse(message) {
  const lowerMessage = message.toLowerCase();

  for (const [key, response] of Object.entries(sampleResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }

  return "Tôi hiểu câu hỏi của bạn về hợp đồng này. Dựa trên phân tích chi tiết, tôi có thể cung cấp đánh giá chuyên sâu về các khía cạnh pháp lý, rủi ro và đề xuất cải thiện. Bạn có thể sử dụng các câu hỏi gợi ý ở trên hoặc hỏi về bất kỳ điều khoản cụ thể nào trong hợp đồng để được tư vấn chi tiết hơn.";
}

// Override sendToAPI for development/demo
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.sendToAPI = function (message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: getMockResponse(message),
        });
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    });
  };
}

// ===== GLOBAL CHAT FUNCTIONS =====
window.sendSuggestedQuestion = function (element) {
  console.log("sendSuggestedQuestion called with:", element);

  let question;

  if (typeof element === "string") {
    question = element;
  } else if (element.hasAttribute("data-question")) {
    // Handle pills with data-question attribute
    question = element.getAttribute("data-question");
  } else {
    // Fallback to text content
    question = element.textContent.trim();
  }

  console.log("Question extracted:", question);

  // Call the internal function to handle the question
  const chatInput = document.getElementById("chat-input");
  console.log("Chat input element:", chatInput);

  if (chatInput) {
    chatInput.value = question;
    console.log("About to call sendMessage()");
    sendMessage();
  } else {
    console.error("Chat input element not found!");
  }
};

window.ChatInterface = {
  sendMessage,
  addMessage,
  scrollToBottom,
  showTypingIndicator,
  hideTypingIndicator,
};

// Test function to verify JavaScript is working
window.testPillClick = function () {
  console.log("Test pill click function called!");
  alert("JavaScript is working!");
};

// ===== SUGGESTION PILLS FUNCTIONALITY =====
function initializeSuggestionPills() {
  console.log("Initializing suggestion pills...");
  const pillsContainer = document.getElementById("suggestion-pills");

  if (!pillsContainer) {
    console.error("Pills container not found!");
    return;
  }

  console.log("Pills container found:", pillsContainer);

  // Add keyboard navigation support
  const pills = pillsContainer.querySelectorAll(".suggestion-pill");
  console.log("Found pills:", pills.length);

  pills.forEach((pill, index) => {
    console.log("Setting up pill", index, pill);
    // Add keyboard support
    pill.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        console.log("Keyboard event triggered for pill:", this);
        window.sendSuggestedQuestion(this);
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        pills[index - 1].focus();
      } else if (e.key === "ArrowRight" && index < pills.length - 1) {
        e.preventDefault();
        pills[index + 1].focus();
      }
    });

    // Add enhanced tooltip functionality
    pill.addEventListener("mouseenter", function () {
      showPillTooltip(this);
    });

    pill.addEventListener("mouseleave", function () {
      hidePillTooltip(this);
    });

    // Add focus/blur for accessibility
    pill.addEventListener("focus", function () {
      showPillTooltip(this);
    });

    pill.addEventListener("blur", function () {
      hidePillTooltip(this);
    });
  });

  // Handle horizontal scroll with mouse wheel
  pillsContainer.addEventListener("wheel", function (e) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      this.scrollLeft += e.deltaY;
    }
  });
}

function showPillTooltip(pill) {
  const question = pill.getAttribute("data-question");
  if (!question) return;

  // Remove existing tooltip
  hidePillTooltip(pill);

  // Create tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "pill-tooltip";
  tooltip.textContent = question;
  tooltip.id = "pill-tooltip-" + Date.now();

  // Position tooltip
  document.body.appendChild(tooltip);

  const pillRect = pill.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Position above the pill
  let left = pillRect.left + pillRect.width / 2 - tooltipRect.width / 2;
  let top = pillRect.top - tooltipRect.height - 8;

  // Adjust if tooltip goes off screen
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }
  if (top < 8) {
    top = pillRect.bottom + 8;
    tooltip.classList.add("tooltip-below");
  }

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";

  // Store reference for cleanup
  pill._tooltip = tooltip;

  // Animate in
  setTimeout(() => {
    tooltip.classList.add("visible");
  }, 10);
}

function hidePillTooltip(pill) {
  if (pill._tooltip) {
    pill._tooltip.remove();
    pill._tooltip = null;
  }
}
