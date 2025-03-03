export const data = {
  questions: [
    {
      heading: "One Thing You Could Do Better",
      question:
        "If you could choose only one thing that you could do better, what would it be?",
      answer: "",
    },
    {
      heading: "What would you like to learn more about?",
      question: "",
      answer: "",
    },
    { heading: "", question: "", answer: "" },
    { heading: "", question: "", answer: "" },
    { heading: "", question: "", answer: "" },
    { heading: "", question: "", answer: "" },
    { heading: "", question: "", answer: "" },
    { heading: "", question: "", answer: "" },
  ],
};

async function getAccessToken() {
  try {
    const response = await fetch("https://api.gumroad.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: "Kx-V_WqWygI2R9gcX383DfjzDIEBs0uaHk8TAnbQ320",
        client_id: "7Vj_uGt2Wjql-JSvnO5HfOGPqe5Ft6xb1_yocA_-n-8",
        client_secret: "4Ob3jcJu_VKlzzVxZ9FAvfeExUDgjqBXC54keTchgpA",
        redirect_uri: "https://focilab.com",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    const { access_token, token_type, refresh_token, scope, created_at } =
      responseData;
    console.log("Access Token:", access_token);
    console.log("Token Type:", token_type);
    console.log("Refresh Token:", refresh_token);
    console.log("Scope:", scope);
    console.log("Created At:", created_at);
    return { access_token, token_type, refresh_token, scope, created_at };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

getAccessToken();
