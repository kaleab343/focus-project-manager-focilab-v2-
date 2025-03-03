export const getGoals = async (id) => {
  const response = await fetch(
    "https://main-server1-kiztopia2020-gmailcom.vercel.app/getData",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: id,
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log(data.lastInsertedBook);
    let future = data.lastInsertedBook.future.split("~");
    console.log(future);
  } else {
    console.log(response);
  }
};
