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
    {
      id: 3,
      question: "Hangisi bir programlama dili değildir?",
      options: ["Python", "HTML", "JavaScript", "Java"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "İstanbul'un fethi hangi yılda gerçekleşmiştir?",
      options: ["1453", "1299", "1517", "1481"],
      correctAnswer: 0
    },
    {
      id: 5,
      question: "Hangisi periyodik tabloda bir element değildir?",
      options: ["Altın", "Gümüş", "Bronz", "Bakır"],
      correctAnswer: 2
    },
    {
      id: 6,
      question: "DNA'nın açılımı nedir?",
      options: ["Deoksit Nitrik Asit", "Deoksiribo Nükleik Asit", "Deoksi Nitrat Asit", "Deoksit Nükleo Asit"],
      correctAnswer: 1
    },
    {
      id: 7,
      question: "Hangi hayvan memeli değildir?",
      options: ["Yarasa", "Yunus", "Penguen", "Kanguru"],
      correctAnswer: 2
    },
    {
      id: 8,
      question: "Türkiye'nin en yüksek dağı hangisidir?",
      options: ["Ağrı Dağı", "Erciyes Dağı", "Uludağ", "Palandöken Dağı"],
      correctAnswer: 0
    },
    {
      id: 9,
      question: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?",
      options: ["Venüs", "Mars", "Jüpiter", "Merkür"],
      correctAnswer: 1
    },
    {
      id: 10,
      question: "Osmanlı İmparatorluğu'nun kurucusu kimdir?",
      options: ["Fatih Sultan Mehmet", "Osman Bey", "Yavuz Sultan Selim", "Kanuni Sultan Süleyman"],
      correctAnswer: 1
    },
    {
      id: 11,
      question: "Hangisi bir Nobel ödül kategorisi değildir?",
      options: ["Fizik", "Matematik", "Kimya", "Edebiyat"],
      correctAnswer: 1
    },
    {
      id: 12,
      question: "İnsan vücudundaki en büyük organ hangisidir?",
      options: ["Kalp", "Beyin", "Deri", "Karaciğer"],
      correctAnswer: 2
    }
  ];
}