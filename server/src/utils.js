export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getQuestions() {
  return [
    {
      id: 1,
      question: "Türkiye'nin başkenti neresidir?",
      options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Hangi gezegen Güneş Sistemi'nde en büyüktür?",
      options: ["Mars", "Venüs", "Jüpiter", "Satürn"],
      correctAnswer: 2
    },
    // Add more questions here
  ];
}