// 运行方式：node prisma/seed-listening.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
function loadSentences(filename) {
  const p = path.join(__dirname, "../scripts/sentences-output", filename);
  try {
    return fs.readFileSync(p, "utf-8"); //同步读取文件内容
  } catch {
    return null;
  }
}
async function main() {
  const dataList = [
    {
      title: "A Priceless Bible Returns to Its Longtime Home in Switzerland",
      audioUrl: "/listening-audio/APriceless_Bible_Returns_to.mp3",
      duration: "5:32",
      level: "L2",
      type: "intensive",
      sentences: loadSentences("APriceless_Bible_Returns_to-sentences.json"),
      transcript: `
      A priceless Bible with a mysterious history is being shown in Switzerland near its longtime home at a Christian religious center.

The Moutier-Grandval Bible is considered one of the finest ancient books because of its good condition and the artistry of its creation.

The hand-written book, or manuscript, weighs 22 kilograms. Religious workers called monks produced the book in Tours, France around 1,200 years ago. No one knows how, but it went to Moutier-Grandval Abbey in northwestern Switzerland in the mountainous Jura area.

The British Library keeps the ancient book now. But it has loaned the Bible for three months to the Jura Museum of Art and History in Delemont.

It is only the second time the manuscript has been loaned from London, after being shown at the Jura Museum in 1981 when 32,000 people came to see it.

The museum's director Nathalie Fleury said, "We could even call it a miracle: this…masterpiece has survived the ages, the circumstances of history; it has escaped…wars, fires, revolutions, and has reached us in remarkable condition.”

Around 100 Bibles were produced during the same period in Tours. Eighteen have survived, including three that have special drawings known as illustrations. The Moutier-Grandval Bible is the best-known.

The Bible is going on show in the museum's basement, behind a thick steel door. Sealed inside a glass cabinet, it is the only object in the room.

The manuscript is open on the first page, showing an illustration of the story of Adam and Eve from the Book of Genesis. The colors are still very bright.

The book needs special conditions. As a result, only five people at a time are permitted in the room, for five minutes only.

Claire Breay of the British Library described the Moutier-Grandval Bible as "one of the greatest treasures of the British Library." Breay added that the ancient hand-written Bible "is still bringing people together and bringing, joy, awe and wonder to everyone who sees it."

The book’s 900 pages measure 50 by 38 centimeters. The words are written in two columns of 50 to 52 lines each. The skins of more than 200 sheep were used to make the special writing surface known as parchment.

The book contains four full-page images. Around 20 monks wrote the book in the Latin language in a writing known as Carolingian minuscule script.

Research continues on the parchment and the colors used in the Bible’s images.

Book historian and co-curator Angeline Rais said, "It's very emotional to see it in real life: it's completely different from seeing a reproduction of it in a book or online.”

She told the French News Agency (AFP), "People can see how big it is, how beautiful the colors and the gold still are.”

"There's a lot of mystery around the Bible," said Rais.

How it came to Moutier-Grandval remains unclear.

Some people say the Bible was left behind and forgotten about until it was found in Delemont in the late 1810s or early 1820s. It was sold to an art dealer in 1822.

The British Museum bought the Bible in 1836 for what is equal to $93,600 in today's money.

The Bible even today remains surrounded in mystery. How it was transported from London to Delemont, and all matters of security, remain a guarded secret.

The museum in Jura is showing the Bible until June 8. Experts there hope that the Bible will be shown there again.

I’m John Russell.

Google Play VOA Learning English - Digdok
      `,
      questions: {
        create: [
          {
            questionText:
              "Where did monks originally write the Moutier-Grandval Bible?",
            options: JSON.stringify([
              "Delemont, Switzerland",
              "Tours, France",
              "London, England",
              "Moutier-Grandval Abbey",
            ]),
            answer: 1,
            explanation:
              "文章明确提到僧侣约1200年前在法国图尔（Tours）手工编写了这本书。",
          },
          {
            questionText:
              "Why are only five people at a time permitted to enter the room where the Bible is displayed?",
            options: JSON.stringify([
              "To prevent theft",
              "Because the room is very small",
              "The book needs special conditions",
              "To ensure everyone has enough space",
            ]),
            answer: 2,
            explanation:
              "文中说'The book needs special conditions'，因此限制每批进入人数和停留时间。",
          },
          {
            questionText: "What does 'parchment' refer to in the article?",
            options: JSON.stringify([
              "A type of golden ink",
              "A special writing surface made from sheep skins",
              "A decorative cover for ancient books",
              "A collection of colorful illustrations",
            ]),
            answer: 1,
            explanation:
              "文中说用200多只羊的皮制作了特殊书写表面，即羊皮纸（parchment）。",
          },
          {
            questionText: "What is the main purpose of this article?",
            options: JSON.stringify([
              "The history of the British Library",
              "The discovery of a mysterious Bible in 1820",
              "A temporary exhibition of an ancient Bible in Switzerland",
              "How to preserve 1,200-year-old manuscripts",
            ]),
            answer: 2,
            explanation:
              "文章主要报道了这本1200年历史的珍贵圣经暂时借回瑞士博物馆展出的消息。",
          },
          {
            questionText:
              "The museum's director called the survival of this ______ a miracle.",
            options: JSON.stringify([
              "masterpiece",
              "reproduction",
              "translation",
              "script",
            ]),
            answer: 0,
            explanation:
              "馆长原话：'this…masterpiece has survived the ages'，称其为杰作（masterpiece）。",
          },
          {
            questionText: "The hand-written Bible weighs ______ kilograms.",
            options: JSON.stringify(["12", "22", "32", "50"]),
            answer: 1,
            explanation:
              "文章明确提到'The hand-written book…weighs 22 kilograms'。",
          },
          {
            questionText:
              "The British Museum bought the Bible in 1836 for what is equal to $______ in today's money.",
            options: JSON.stringify(["1,200", "32,000", "93,600", "182,000"]),
            answer: 2,
            explanation:
              "文章末尾明确写道'for what is equal to $93,600 in today's money'。",
          },
        ],
      },
    },
    {
      title: "Wilbur and Orville Wright: The First Airplane",
      audioUrl: "/listening-audio/Wilbur_and_Orville_Wright.mp3",
      duration: "4:26",
      level: "L0",
      type: "intensive",
      sentences: loadSentences("Wilbur_and_Orville_Wright-sentences.json"),
      transcript: `
Wilbur and Orville Wright are the American inventors who made a small engine-powered flying machine. They proved that flight without the aid of gas-filled balloons was possible.

Wilbur Wright was born in 1867 near Melville, Indiana. His brother Orville was born four years later in Dayton, Ohio.

As they grew up, the Wright brothers experimented with mechanical things. Later, the Wright brothers began to design their own flying machine. They used ideas they had developed from earlier experiments with a toy helicopter, kites, the printing machine and bicycles.

Soon, they needed a place to test their ideas about flight. The best place with the best wind conditions seemed to be a piece of sandy land in North Carolina along the coast of the Atlantic Ocean. It was called Kill Devil Hill, near the town of Kitty Hawk.

The Wright brothers did many tests with gliders at Kitty Hawk. With these tests, they learned how to solve many problems.

By the autumn of 1903, Wilbur and Orville had designed and built an airplane powered by a gasoline engine. The plane had wings 12 meters across. It weighed about 340 kilograms, including the pilot.

On December 17th, 1903, they made the world's first flight in a machine that was heavier than air and powered by an engine. Orville flew the plane 36 meters. He was in the air for 12 seconds. The two brothers made three more flights that day.

Four other men watched the Wright brothers' first flights. One of the men took pictures. Few newspapers, however, noted the event.

It was almost five years before the Wright brothers became famous. In 1908, Wilbur went to France. He gave demonstration flights at heights of 90 meters. A French company agreed to begin making the Wright brothers' flying machine.

Orville made successful flights in the United States at the time Wilbur was in France. The United States War Department agreed to buy a Wright brothers' plane. Wilbur and Orville suddenly became world heroes. But the brothers were not seeking fame. They returned to Dayton where they continued to improve their airplanes. They taught many others how to fly.

Wilbur Wright died of typhoid fever in 1912. Orville Wright continued designing and inventing until he died many years later, in 1948.

Today, the Wright brothers' first airplane is in the Air and Space Museum in Washington, D.C. Visitors to the museum can look at the Wright brothers' small plane. Then they can walk to another area and see space vehicles and a rock collected from the moon. The world has changed a lot since Wilbur and Orville Wright began the modern age of flight over one hundred years ago.

I’m John Russell.
      `,
      questions: {
        create: [
          {
            questionText:
              "Where did the Wright brothers choose to test their flying machine?",
            options: JSON.stringify([
              "Melville, Indiana",
              "Dayton, Ohio",
              "Kitty Hawk, North Carolina",
              "Washington, D.C.",
            ]),
            answer: 2,
            explanation:
              "文章提到他们选择了北卡罗来纳州基蒂霍克（Kitty Hawk）附近的Kill Devil Hill测试飞行器。",
          },
          {
            questionText:
              "Why were the Wright brothers not immediately famous after their first flight?",
            options: JSON.stringify([
              "They wanted to keep their invention secret",
              "Very few newspapers noted the event",
              "The flight lasted only 12 seconds",
              "They failed to prove engine-powered flight was possible",
            ]),
            answer: 1,
            explanation:
              "文章说’Few newspapers…noted the event’，直到五年后威尔伯去法国演示才成名。",
          },
          {
            questionText:
              "In 1908, Wilbur gave ‘demonstration’ flights in France. What does ‘demonstration’ most closely mean here?",
            options: JSON.stringify([
              "Educational lecture",
              "Public showing",
              "Private testing",
              "Secret experiment",
            ]),
            answer: 1,
            explanation:
              "demonstration指公开展示飞行器如何工作，以赢得合作，属同义替换题。",
          },
          {
            questionText: "What is the primary focus of this article?",
            options: JSON.stringify([
              "The childhood of the Wright brothers",
              "The development and success of the first airplane",
              "How planes are displayed in modern museums",
              "The brothers’ business partnership in France",
            ]),
            answer: 1,
            explanation:
              "文章主线是莱特兄弟从实验到成功研制并驾驶第一架动力飞机的历史过程。",
          },
          {
            questionText:
              "On December 17th, 1903, Orville flew the plane ______ meters.",
            options: JSON.stringify(["12", "36", "90", "340"]),
            answer: 1,
            explanation: "文章明确写道’Orville flew the plane 36 meters’。",
          },
          {
            questionText:
              "The Wright brothers used ideas developed from a toy ______, kites, and bicycles.",
            options: JSON.stringify([
              "balloon",
              "helicopter",
              "rocket",
              "boat",
            ]),
            answer: 1,
            explanation:
              "原文：’ideas they had developed from earlier experiments with a toy helicopter, kites…and bicycles’。",
          },
          {
            questionText: "Wilbur Wright died of ______ fever in 1912.",
            options: JSON.stringify(["yellow", "scarlet", "typhoid", "jungle"]),
            answer: 2,
            explanation:
              "文章明确记录’Wilbur Wright died of typhoid fever in 1912’。",
          },
        ],
      },
    },
    {
      title: "Llama at Children’s Camp Recognized as Oldest in Captivity",
      audioUrl: "/listening-audio/Llama_at_Childrens_Camp.mp3",
      duration: "4:40",
      level: "L1",
      type: "intensive",
      sentences: loadSentences("Llama_at_Childrens_Camp-sentences.json"),
      transcript: `
A llama at a North Carolina recreational camp for sick children has been declared the world’s oldest llama in captivity.

His name is Whitetop, and he is 27 years old. The Guinness World Records declared him the oldest following the death of the llama called Dalai Llama. Dalai lived in Albuquerque, New Mexico and had been declared oldest shortly after his 27th birthday in 2023.

Whitetop was donated to the Victory Junction camp in 2006, just two years after race car driver Kyle Petty and his family opened the camp. Victory Junction was established in honor of Petty's son, Adam, who died in 2000 at just 19 years old. He was killed in a car crash while training for a race.

The camp sits on 34 hectares in the Petty family’s hometown of Randleman, North Carolina. It is designed for children with conditions that include cancer, kidney and heart disease, cerebral palsy, spina bifida and other neurological and physical disabilities. Their attendance at the camp is free of cost.

Whitetop has become known there for his easy, sweet and loving way. He lies still while campers pet him, which can comfort children. The activity provides the young people with important sensory experience, said Billie Davis, the camp's barn director.

Whitetop “really gets to help campers come out of their shell,” she said. "He can be kind of intimidating at first, but once they come over to him and love on him and pet on him, they just realize how sweet he is.”

Whitetop likes to roll in fresh wood chips, eat wet alfalfa and pose for selfies.

“If you try to take a picture of him from the side, he’s not into it," Davis said.

Davis credits Whitetop's long life to great medical care and exercise, as well as simply loving his job.

The Denver Zoo Conservation Alliance says llamas live an average of 15 years.

Whitetop has developed the disease arthritis but otherwise is very healthy, said Davis. The only time the llama seems unhappy is when he is left alone by his friends, Gus-Gus, a small cow, and Jed and Jethro, two small donkeys.

Thirty-three-year-old Stephanie Wilkerson first went to the camp’s family weekend event in 2006 after she was diagnosed with Type 1 diabetes. She was a little nervous around Whitetop at first. But, she said, she soon realized petting him and giving him hugs made her feel better.

With Whitetop’s new fame, the camp has started selling clothing covered in images of Whitetop wearing sunglasses. All the money made from sales goes to supporting the camp.

I’m Caty Weaver.
      `,
      questions: {
        create: [
          {
            questionText:
              "How old is Whitetop, the llama recognized by Guinness World Records?",
            options: JSON.stringify(["15", "19", "23", "27"]),
            answer: 3,
            explanation:
              "文章开头明确说'he is 27 years old'，是人工饲养下最长寿的大羊驼。",
          },
          {
            questionText: "How does Whitetop benefit the children at the camp?",
            options: JSON.stringify([
              "By teaching them how to ride animals",
              "By providing a calming sensory experience",
              "By performing tricks during races",
              "By encouraging them to run faster",
            ]),
            answer: 1,
            explanation:
              "文中说孩子们抚摸Whitetop可以获得安慰，提供重要的感官体验（sensory experience）。",
          },
          {
            questionText:
              "Whitetop 'can be kind of intimidating at first.' What does 'intimidating' mean?",
            options: JSON.stringify([
              "Friendly and sweet",
              "Small and cute",
              "Frightening or scary",
              "Old and slow",
            ]),
            answer: 2,
            explanation: "intimidating意为令人生畏的、吓人的，属词义理解题。",
          },
          {
            questionText: "What is the main subject of this article?",
            options: JSON.stringify([
              "The history of race car driver Kyle Petty",
              "A world-record llama helping sick children",
              "The average lifespan of llamas in the wild",
              "New medical treatments for arthritis in animals",
            ]),
            answer: 1,
            explanation:
              "文章围绕27岁世界纪录大羊驼Whitetop及其在病童营地发挥的治愈作用展开。",
          },
          {
            questionText:
              "Victory Junction camp was established in honor of ______.",
            options: JSON.stringify([
              "Kyle Petty",
              "Adam Petty",
              "Whitetop",
              "Billie Davis",
            ]),
            answer: 1,
            explanation:
              "文章说营地是为了纪念在赛车训练中去世的Adam Petty而建立的。",
          },
          {
            questionText:
              "Davis credits Whitetop's long life to great ______ care and exercise.",
            options: JSON.stringify([
              "dental",
              "surgical",
              "medical",
              "mental",
            ]),
            answer: 2,
            explanation:
              "原文：'Davis credits Whitetop's long life to great medical care and exercise'。",
          },
          {
            questionText:
              "Whitetop has developed ______ but is otherwise very healthy.",
            options: JSON.stringify([
              "diabetes",
              "arthritis",
              "cancer",
              "heart disease",
            ]),
            answer: 1,
            explanation:
              "文中明确说'Whitetop has developed the disease arthritis but otherwise is very healthy'。",
          },
        ],
      },
    },
    {
      title: "In Kenya, High-Altitude Town Serves Champion Runners",
      audioUrl: "/listening-audio/In_Kenya_High_Altitude_Town.mp3",
      duration: "7:18",
      level: "L2",
      type: "intensive",
      sentences: loadSentences("In_Kenya_High_Altitude_Town-sentences.json"),
      transcript: `
As day breaks over the small Kenyan town of Iten, its dusty paths come alive with groups of runners. Often the groups are followed by children headed to school.

Some of the runners are top Kenyan athletes. Others travel from farther away.

All are here because of Iten’s altitude. At about 2,400 meters above sea-level, it has produced some of the best long-distance runners in the world.

The town is about 350 kilometers northwest of Nairobi, the Kenyan capital. To serve the ever-growing interest from both professional and amateur athletes, hotels and other short-stay housing businesses continue to open around Iten.

Ryan Mex, a partly professional runner and trainer, came from the southern European island nation of Malta. He brought three athletes with him to get a competitive edge ahead of his country’s marathon season. Marathons are foot races with a distance of about 42 kilometers.

Mex is visiting Iten for the first time.

“Next time I want to come with a larger group since we really like the training environment here,” he said. "This is the best place in the world to come for a training camp.”

Town produces Olympic champions

Iten is home to about 42,000 people, mostly farmers. It has also been a temporary home to many world champions, including two-time Olympic gold medal winning runners, Eliud Kipchoge and David Rudisha. Both are Kenyan.

Also, British four-time Olympic champion Mo Farah would train in Iten for months at a time.

The town was declared a World Athletics Heritage Landmark in 2019 and even calls itself the “Home of Champions.”

Lornah Kiplagat, a Kenyan-born three-time Olympian for the Netherlands, attended high school in Iten. She is the 2008 world half-marathon champion and now owns a training center in the town.

“If you train at 2,400 meters, your lungs expand, your red blood cells increase, and so when you go to low altitude you feel like you are flying,” Kiplagat explained.

Amanal Petros, a top marathoner from Germany, spends six months at Kiplagat’s center every year. Born in the Eritrean highlands, he was used to running at high altitude. He says Iten’s high altitude is not the only reason he keeps returning to train.

“I’ve trained in many places in the USA and Europe,” he said. “Organizing a training partner in Europe is not easy. But in Iten, the home of champions, wherever you go you find a lot of athletes who can train with you.”

Jean Paul Fourier opened the Kerio View Hotel in 2002 with a just few rooms at first. It now holds as many as 50 guests and includes a fitness center.

“I made a small investment and it has really grown,” Fourier said.

The main training season goes from April to September.

Before the boom

One man here still remembers what Iten was like before all this happened. His name is Brother Colm O’Connell. He is a former leader of St. Patrick’s High School. Several champion runners attended the school including Rudisha, Vivian Cheruiyot, Matthew Birir and Brimin Kipruto.

O’Connell first came to Iten to teach in 1976. He says that back then, the town was just a few houses and St. Patrick’s School.

“That was really the starting point of what Iten eventually became, what we see today,” O’Connell said. Its huge change began “when the sport became professional," he added.

"Before that, athletes were confined to their place of work. But when professionalism came in, athletes could now sit down with their managers and with shoe companies and decide no, I can become a full-time career athlete.”

O’Connell went on to reform the athletics program at St. Patrick’s, and 25 of his students became world champions. Some of them came back to run their own athletics programs.

The town around the school expanded fast, as runners from all over the world discovered the training possibilities it had. O’Connell estimates there are around 500 visiting runners in the town at any one time throughout the main season.

“We see fun runners, we have runners with personal goals, we have people running a marathon to fundraise," he said. "In other words, running is a sport for everybody and it has something to offer everybody.”

I’m Caty Weaver.

      `,
      questions: {
        create: [
          {
            questionText: "What is the approximate altitude of Iten?",
            options: JSON.stringify([
              "350 meters",
              "1,000 meters",
              "2,400 meters",
              "42,000 meters",
            ]),
            answer: 2,
            explanation:
              "文章明确说'At about 2,400 meters above sea-level'，这是Iten产出顶级跑者的关键原因。",
          },
          {
            questionText:
              "According to Lornah Kiplagat, what happens when you train at high altitude?",
            options: JSON.stringify([
              "You lose weight faster",
              "Your lungs expand and red blood cells increase",
              "The cooler weather helps you run longer",
              "The risk of sports injuries is reduced",
            ]),
            answer: 1,
            explanation:
              "原文：'your lungs expand, your red blood cells increase, and so when you go to low altitude you feel like you are flying'。",
          },
          {
            questionText:
              "What change caused Iten to 'boom' as a training destination?",
            options: JSON.stringify([
              "Higher altitude",
              "Professionalism in athletics",
              "New shoe technology",
              "Better roads",
            ]),
            answer: 1,
            explanation:
              "O'Connell说'Its huge change began when the sport became professional'，运动职业化是关键转折点。",
          },
          {
            questionText: "What does this article mainly describe?",
            options: JSON.stringify([
              "The life of Eliud Kipchoge",
              "How a Kenyan town became a hub for world champions",
              "The history of St. Patrick's High School",
              "The best marathon routes in Africa",
            ]),
            answer: 1,
            explanation:
              "文章描述了肯尼亚小镇Iten凭借海拔优势和专业训练环境成为跑者圣地的过程。",
          },
          {
            questionText:
              "Iten is about ______ kilometers northwest of Nairobi.",
            options: JSON.stringify(["42", "50", "350", "500"]),
            answer: 2,
            explanation:
              "原文：'The town is about 350 kilometers northwest of Nairobi'。",
          },
          {
            questionText:
              "Brother O'Connell first came to Iten to ______ in 1976.",
            options: JSON.stringify(["run", "teach", "farm", "build"]),
            answer: 1,
            explanation:
              "原文：'O'Connell first came to Iten to teach in 1976'。",
          },
          {
            questionText:
              "Iten is home to about ______ people, mostly farmers.",
            options: JSON.stringify(["2,400", "15,000", "42,000", "500,000"]),
            answer: 2,
            explanation:
              "原文：'Iten is home to about 42,000 people, mostly farmers'。",
          },
        ],
      },
    },
    {
      title: "Growing Number of Birdwatchers Find Joy in Smart Bird Feeders",
      audioUrl: "/listening-audio/Growing_Number_of_Birdwatchers.mp3",
      duration: "4:32",
      level: "L1",
      type: "intensive",
      sentences: loadSentences("Growing_Number_of_Birdwatchers-sentences.json"),
      transcript: `
Marin Plank had no interest in birds when she gave her husband a camera-equipped, or smart, bird feeder for his birthday. But that changed. In fact, the American woman became so interested in watching birds that most of the gifts she received for Christmas last month were bird-related.

"This is who I am now," she said.

Friends sometimes stop Plank on the street to talk about the images of birds that she shares on social media. She also now orders bird food to be sent to her home in Lewes, Delaware.

It all started when she got her first message from the Bird Buddy app, which provides photos and videos that can be saved and shared.

When she saw the birds looking into the camera and the expressions on their faces, they won her heart, she said.

Bringing wildlife closer

Although the North American bird population continues to drop sharply, the number of people watching birds is increasing. In the past, bird watching was an outdoor activity. But now, smart feeders permit people to watch the wildlife from inside their homes.

Franci Zidar is founder and CEO of Bird Buddy, which has sold 350,000 smart bird feeders since 2022. He said that people with a strong interest in watching birds usually put much effort into finding them in the wild. “There are, however, 20 to 30 species of birds in most U.S. backyards that people either don't really know or appreciate."

Several other companies, including Birdfy, also make bird feeders that have cameras. Most people buy bird feeders because they want to help support the animals. Smart bird feeders help supply that support just as traditional feeders do. But, smart feeders go a step further, Zidar said, by letting people watch and enjoy the birds they feed.

Not just birds on camera

Bird Buddy has proven so successful that the company is creating other products to provide appealing environments for butterflies and other insects. Bird Buddy announced the new products at CES, the event formerly known as the Consumer Electronics show, in Las Vegas, Nevada.

Judy Ashley of Ipswich, Massachusetts already had 11 bird feeders in her yard when she added a Bird Buddy last year. She recently captured a picture of a yellow-throated warbler at the feeder. The bird is a rarity in the northeastern United States.

She said, "What's amazing is how close you can see the details of backyard birds that you just wouldn't see if you just stood there for hours with binoculars."

Rachel Matthews in Austin, Texas, has three camera-equipped feeders, including one for hummingbirds. Matthews grew up with bird feeders, but the smart feeders have increased her interest, she said.

"I love having the camera, and I see detail that even with my binoculars I'd never seen," she said, noting the “red eyebrows and little feathers” on female cardinals.

In November, the National Audubon Society announced a partnership with Bird Buddy to educate the public about bird conservation. The partnership could provide a way to get data gathered by birdfeeders to scientists, an Audubon Society spokesperson said.

In Delaware, Plank has gotten to know the birds that visit her feeder a little better. "I give them these personalities in my mind, and it's about having them right in front of my face,” she said.

I’m Jill Robbins.
      `,
      questions: {
        create: [
          {
            questionText:
              "How did Marin Plank first become interested in birds?",
            options: JSON.stringify([
              "She grew up with bird feeders in her yard",
              "She received a smart feeder for Christmas",
              "She gave her husband a smart bird feeder as a gift",
              "She joined the National Audubon Society",
            ]),
            answer: 2,
            explanation:
              "原文：'she gave her husband a camera-equipped…bird feeder for his birthday'，结果自己反而迷上了观鸟。",
          },
          {
            questionText:
              "What is the main advantage of smart bird feeders over traditional ones?",
            options: JSON.stringify([
              "They are cheaper and easier to clean",
              "They let people watch wildlife from inside their homes",
              "They can store more bird food",
              "They automatically attract rare species",
            ]),
            answer: 1,
            explanation:
              "原文：'smart feeders permit people to watch the wildlife from inside their homes'。",
          },
          {
            questionText:
              "Judy Ashley saw a yellow-throated warbler, described as a 'rarity.' What does 'rarity' mean?",
            options: JSON.stringify([
              "A very large bird",
              "A bird that sings loudly",
              "Something uncommon or unusual",
              "A bird that eats insects",
            ]),
            answer: 2,
            explanation:
              "rarity指罕见的、不寻常的事物，该鸟在美国东北部极为少见，属词义理解题。",
          },
          {
            questionText: "What trend does this article mainly discuss?",
            options: JSON.stringify([
              "The declining bird population in North America",
              "The development of insect-friendly environments",
              "Increasing birdwatching interest through technology",
              "Partnerships between tech companies and scientists",
            ]),
            answer: 2,
            explanation:
              "文章核心是智能喂鸟器技术如何带动更多人参与观鸟活动这一趋势。",
          },
          {
            questionText:
              "The Bird Buddy app provides photos that can be saved and ______.",
            options: JSON.stringify(["sold", "deleted", "shared", "edited"]),
            answer: 2,
            explanation:
              "原文：'provides photos and videos that can be saved and shared'。",
          },
          {
            questionText:
              "Franci Zidar is the founder and ______ of Bird Buddy.",
            options: JSON.stringify([
              "designer",
              "CEO",
              "technician",
              "salesperson",
            ]),
            answer: 1,
            explanation:
              "原文：'Franci Zidar is founder and CEO of Bird Buddy'。",
          },
          {
            questionText:
              "Plank now receives mostly bird-related gifts for ______.",
            options: JSON.stringify([
              "her birthday",
              "her anniversary",
              "Christmas",
              "Thanksgiving",
            ]),
            answer: 2,
            explanation:
              "原文：'most of the gifts she received for Christmas last month were bird-related'。",
          },
        ],
      },
    },
    {
      title: "New York Yankees Can Now Grow Beards",
      audioUrl: "/listening-audio/New_York_Yankees.mp3",
      duration: "3:04",
      level: "L1",
      type: "intensive",
      sentences: loadSentences("New_York_Yankees-sentences.json"),
      transcript: `
A top professional American baseball team recently announced it would change a long-held rule about its players’ appearance.

The New York Yankees dropped their ban on beards, or facial hair that covers the cheeks and chin.

Former team owner George Steinbrenner banned beards in 1976. His son, and current owner, Hal Steinbrenner, announced an end to the ban in late February. Hal Steinbrenner called the former policy “outdated.”

“This generation, the vast majority of 20, 30s-into-the-40s men in this country have beards,” Steinbrenner told reporters at a news conference. “It is a part of who these younger men are. It’s part of their character,” he added.

Steinbrenner noted that he, himself, had never worn a beard and found it difficult to relate to the desire to have one. But, he said, the ban seemed “somewhat unreasonable.”

His father, George Steinbrenner announced the policy during spring training in 1976, ordering no long hair or beards. Mustaches, hair directly below the nose, were permitted.

“My dad was in the military. He believed that a team should look in a disciplined manner," Hal Steinbrenner said. “Very important to my father, but again (for) my father, nothing is more important than winning and that's in the back of my mind.”

Hal Steinbrenner succeeded his father as controlling owner of the Yankees in November 2008. He said he had considered the beard issue for the last 10 years and discussed the possible change recently with Yankee star players Aaron Judge, Giancarlo Stanton and Gerrit Cole.

There are conditions attached to the new beard policy, however. In a statement, Hal Steinbrenner described permissible beards among players and other Yankee employees as “well-groomed.”

I’m Caty Weaver.

      `,
      questions: {
        create: [
          {
            questionText:
              "Who originally banned beards for the New York Yankees in 1976?",
            options: JSON.stringify([
              "Hal Steinbrenner",
              "George Steinbrenner",
              "Aaron Judge",
              "Gerrit Cole",
            ]),
            answer: 1,
            explanation:
              "原文：'Former team owner George Steinbrenner banned beards in 1976'。",
          },
          {
            questionText:
              "Why did Hal Steinbrenner decide to end the beard ban?",
            options: JSON.stringify([
              "He wanted to look more like his father",
              "He felt beards would help the team win",
              "He considered the policy outdated for this generation",
              "Star players forced him to change it",
            ]),
            answer: 2,
            explanation:
              "哈尔说这一政策已'outdated'，胡须是现代年轻男性个性的一部分。",
          },
          {
            questionText:
              "Hal said beards must be 'well-groomed.' What does 'well-groomed' mean?",
            options: JSON.stringify([
              "Extremely long",
              "Neatly kept and clean",
              "Shaved off completely",
              "Any style is allowed",
            ]),
            answer: 1,
            explanation:
              "well-groomed意为修剪整齐、保持干净，属词义同义替换题。",
          },
          {
            questionText: "What is the main news event in this article?",
            options: JSON.stringify([
              "The Yankees won a major championship",
              "A famous baseball owner passed away",
              "The Yankees dropped a long-held ban on beards",
              "New grooming products for baseball players",
            ]),
            answer: 2,
            explanation: "核心新闻是纽约洋基队废除了执行数十年的球员胡须禁令。",
          },
          {
            questionText:
              "Under the old rule, ______ were allowed but beards were not.",
            options: JSON.stringify([
              "long hair",
              "mustaches",
              "earrings",
              "tattoos",
            ]),
            answer: 1,
            explanation:
              "原文：'Mustaches, hair directly below the nose, were permitted'。",
          },
          {
            questionText:
              "Hal Steinbrenner succeeded his father as controlling owner of the Yankees in ______.",
            options: JSON.stringify(["1976", "2000", "2008", "2026"]),
            answer: 2,
            explanation:
              "原文：'Hal Steinbrenner succeeded his father as controlling owner of the Yankees in November 2008'。",
          },
        ],
      },
    },
    {
      title: "Private Moon Missions Include Hits and Misses",
      audioUrl: "/listening-audio/Private_Moon.mp3",
      duration: "6:58",
      level: "L3",
      type: "intensive",
      sentences: loadSentences("Private_Moon-sentences.json"),
      transcript: `
The American space agency NASA is currently using private companies to launch spacecraft to the moon. So far, the private, or commercial, missions have included both successes and failures.

The efforts support NASA’s preparations for its future moon exploration plans, beginning with its Artemis program. Artemis aims to send astronauts to the moon for the first time since NASA’s Apollo 17 mission in 1972.

But in recent years, a series of private spacecraft have been collecting data on lunar conditions and possible landing areas. The spacecraft are equipped with tools and instruments to help NASA learn about the moon’s environment.

Here is a look at some of the private lunar missions that have launched so far:

In 2019, a commercially developed lander from Israel became the first spacecraft to attempt a landing on the moon. The lander was called Beresheet, which in Hebrew means “in the beginning.” The private mission was led by the company SpaceIL in cooperation with the Israeli Space Agency.

On April 11, 2019, controllers on Earth lost contact with Beresheet as it was about to attempt a landing. Officials from SpaceIL later said the spacecraft suffered a non-survivable hard landing on the lunar surface. Shortly after the failure, SpaceIL announced it was planning another mission called Beresheet 2. No date has been set for that mission.

The Japanese company ispace launched a lunar lander in 2023. But the lander, called HAKUTO-R, crashed. The spacecraft was also carrying a rover – a vehicle to explore the moon’s surface – as well as a small robot. Ispace officials later said the crash was linked to the failure of a computer sensor.

The Japanese company has another lander headed to the moon. Company officials have said the landing attempt of that spacecraft, Resilience, will take place in June. Ispace says this mission will attempt to deploy a rover on the lunar surface to perform “surface exploration and data collection.”

In February 2024, Texas-based Intuitive Machines became the first private company to successfully land a spacecraft on the moon. But its Odysseus lander fell over on its side. The spacecraft was able to operate only for a short time with limited communications.

Another U.S. company, Astrobotic Technology, also tried to send a lander to the moon in 2024. But that lander, called Peregrine, developed a fuel leak shortly after launch and did not reach the moon.

On March 2, U.S. company Firefly Aerospace successfully landed its Blue Ghost spacecraft on the moon. The lander touched down on part of the moon’s near side called Mare Crisium. Firefly said the spacecraft landed in the right position and was operating normally.

The latest landing attempt happened on March 6. Intuitive Machines built and operated the Athena lander. But that mission failed after the spacecraft landed sideways near the moon’s south pole.

Officials from Intuitive Machines said the lander missed its landing target by more than 250 meters and landed in a cold crater. The next day, the company said the spacecraft was able to send back pictures confirming its position and activating a few experiments. But shortly after, the lander stopped operating.

Both Intuitive Machines and ispace have plans for more moon missions in the coming years.

The companies have contracts with NASA to provide space flight services and carry equipment and supplies to the moon. Such materials are called rocket payloads.

The NASA program is officially called the Commercial Lunar Payload Services (CLPS) program. It aims to turn over many of the country’s major space missions to private companies to reduce costs. Several companies take part in the program.

NASA says the agency aims to launch at least two private landers to the moon each year. That is because some missions will fail. The space agency’s top science officer is Nicky Fox. She recently told the Associated Press the missions “open up a whole new way for us to get more science to space and to the moon."

I’m Bryan Lynn.
      `,
      questions: {
        create: [
          {
            questionText:
              "What is the name of NASA's program to return astronauts to the moon?",
            options: JSON.stringify([
              "Apollo 17",
              "Artemis",
              "Beresheet",
              "CLPS",
            ]),
            answer: 1,
            explanation:
              "原文：'its Artemis program…aims to send astronauts to the moon'。",
          },
          {
            questionText:
              "Why does NASA continue launching private landers even when some fail?",
            options: JSON.stringify([
              "They have too much money to spend",
              "To test which company crashes fastest",
              "To reduce costs and get more science data",
              "NASA no longer has its own rockets",
            ]),
            answer: 2,
            explanation:
              "NASA科学官说这些任务'open up a whole new way for us to get more science to space'，同时降低成本。",
          },
          {
            questionText: "What are rocket 'payloads'?",
            options: JSON.stringify([
              "The fuel needed for launch",
              "Equipment and supplies carried to space",
              "The cost of a private mission",
              "The speed at which a rocket travels",
            ]),
            answer: 1,
            explanation:
              "原文：'materials are called rocket payloads'，指火箭携带的设备和物资。",
          },
          {
            questionText: "What does this article mainly summarize?",
            options: JSON.stringify([
              "The history of the Apollo missions",
              "Recent successes and failures of private moon landings",
              "How to build a lunar rover",
              "NASA's plans to build a moon colony",
            ]),
            answer: 1,
            explanation: "文章回顾了近年来多家私人公司尝试登月任务的成败情况。",
          },
          {
            questionText:
              "The first private attempt to land on the moon was by a company from ______.",
            options: JSON.stringify(["Japan", "Israel", "USA", "India"]),
            answer: 1,
            explanation:
              "原文：'a commercially developed lander from Israel became the first spacecraft to attempt a landing on the moon'。",
          },
          {
            questionText:
              "The HAKUTO-R crash was linked to the failure of a computer ______.",
            options: JSON.stringify(["engine", "sensor", "battery", "screen"]),
            answer: 1,
            explanation:
              "原文：'the crash was linked to the failure of a computer sensor'。",
          },
          {
            questionText:
              "The Odysseus lander successfully landed but fell over on its ______.",
            options: JSON.stringify(["head", "back", "side", "legs"]),
            answer: 2,
            explanation: "原文：'its Odysseus lander fell over on its side'。",
          },
        ],
      },
    },
    {
      title: "Researchers Use New Methods to Date Ancient Skeleton",
      audioUrl: "/listening-audio/Researchers.mp3",
      duration: "4:15",
      level: "L3",
      type: "intensive",
      sentences: loadSentences("Researchers-sentences.json"),
      transcript: `
Scientists have dated the ancient skeleton of a child that drew a lot of attention because it appeared to have both human and Neanderthal qualities.

The nearly complete skeleton, first discovered 27 years ago in central Portugal, was red in color. Scientists think it may have been wrapped in a painted animal skin before burial.

When the remains were discovered, scientists noted that some of the bone structure looked Neanderthal. The researchers suggested that the child’s ancestors came from populations in which humans and Neanderthals mated and mixed. The idea was radical at that time.

But progress in genetics has since shown those mixed populations existed — and people today still carry Neanderthal genetic material, or DNA.

But scientists have had trouble learning when exactly the child lived. They were were not able to use traditional carbon dating on the bones due to corruption of the remains by plants or other sources. Instead, researchers dated some charcoal and animal bones around the skeleton to between 27,700 and 29,700 years ago.

However, dating techniques have since improved. Researchers reported recently in the publication Science Advances that they dated the skeleton by measuring part of a protein found mainly in human bones.

Examining part of a crushed arm, researchers found that the earlier estimate was close. They report the skeleton is from between 27,700 and 28,600 years ago.

Bethan Linscott of the University of Miami is a study writer. Linscott told the Associated Press (AP), “Being able to successfully date the child felt like giving them back a tiny piece of their story.” She described the research experience as a privilege, meaning an honor.

Linscott noted that the first discovery was of more than just a skeleton, but also a burial site of a young child. When dating the bones, she said she could not help but wonder who loved the child, what made them laugh and what their world looked like in the short four years they walked the planet.

Paul Pettitt is an archeologist at Durham University in England who was not involved in the study. He told the AP that the study is an example of how dating methods are becoming more effective and helping scientists better understand the past.

The study of where humans came from is important “for the same reason we keep the portraits of our parents and grandparents,” said study writer João Zilhão of the University of Lisbon.

“It's a way of remembering,” the archeologist said.

I’m John Russell.
      `,
      questions: {
        create: [
          {
            questionText:
              "Where was the ancient child's skeleton first discovered?",
            options: JSON.stringify([
              "Central Portugal",
              "Miami, Florida",
              "Durham, England",
              "Lisbon, Portugal",
            ]),
            answer: 0,
            explanation:
              "原文：'first discovered 27 years ago in central Portugal'。",
          },
          {
            questionText:
              "Why couldn't scientists use traditional carbon dating on the child's bones?",
            options: JSON.stringify([
              "The bones were too old",
              "The remains were corrupted by plants or other sources",
              "Scientists did not have enough charcoal",
              "The skeleton was too fragile to be touched",
            ]),
            answer: 1,
            explanation:
              "原文：'not able to use traditional carbon dating on the bones due to corruption of the remains by plants or other sources'。",
          },
          {
            questionText:
              "The idea that humans and Neanderthals mixed was described as 'radical.' What does 'radical' mean here?",
            options: JSON.stringify([
              "Very simple",
              "Extremely new and different",
              "Scientifically proven",
              "Very boring",
            ]),
            answer: 1,
            explanation:
              "radical意为激进的、根本性的，指在当时看来非常新颖且具冲击力的想法，属词义题。",
          },
          {
            questionText: "What is the main focus of this research article?",
            options: JSON.stringify([
              "The discovery of a new burial site in Portugal",
              "Using protein dating to determine the age of an ancient skeleton",
              "Proof that Neanderthals are still alive today",
              "How to preserve ancient animal skins",
            ]),
            answer: 1,
            explanation:
              "文章主要介绍通过测量蛋白质的新技术更准确地确定这具古老骨架年代的研究。",
          },
          {
            questionText: "The skeleton was found to be ______ in color.",
            options: JSON.stringify(["white", "black", "red", "gold"]),
            answer: 2,
            explanation:
              "原文：'The nearly complete skeleton…was red in color'。",
          },
          {
            questionText:
              "Linscott described the research experience as a ______, meaning an honor.",
            options: JSON.stringify([
              "privilege",
              "mistake",
              "challenge",
              "secret",
            ]),
            answer: 0,
            explanation:
              "原文：'She described the research experience as a privilege, meaning an honor'。",
          },
          {
            questionText:
              "The child is estimated to have walked the planet for only ______ years.",
            options: JSON.stringify(["four", "ten", "twenty", "forty"]),
            answer: 0,
            explanation:
              "原文：'the short four years they walked the planet'。",
          },
        ],
      },
    },
    {
      title: "Discovery Provides New Details on Early Use of Bone Tools",
      audioUrl: "/listening-audio/Discovery.mp3",
      duration: "4:49",
      level: "L2",
      type: "intensive",
      sentences: loadSentences("Discovery-sentences.json"),
      transcript: `
A recent discovery of bones in Tanzania suggests early humans commonly used animal bones to make cutting tools 1.5 million years ago.

Past research has shown our early ancestors made simple tools from stones as early as 3.3 million years ago. But bone tools appear to have been developed much later.

The discovery in Tanzania included a collection of 27 formed and sharpened bones. It pushes back the date for ancient bone tool use by around 1 million years.

Researchers recently described their discovery in a study in the scientific publication Nature.

William Harcourt-Smith is a scientist with the American Museum of Natural History. He did not take part in the latest research.

Harcourt-Smith told The Associated Press the findings show that ancient humans used a number of materials and “had rather more complex tool kits than previously we thought."

The bone tools measured up to around 40 centimeters. Most of them came from the leg bones of large animals such as elephants and hippos. Early humans likely made the tools by breaking off the thick ends of leg bones and using a stone to remove smaller pieces.

Ignacio de la Torre is with the Spanish National Research Council. He helped lead the research. De la Torre said this method was likely used to create one sharpened edge and one pointed tip. The bone tools were “probably used as a hand axe,” he added.

The “hand axe” was likely used for cutting up dead animals, de la Torre said. This kind of blade would be helpful for removing meat from dead elephant and hippo bodies. He explained, “We don’t believe they were hunting these animals. They were probably scavenging.”

Scavenging means to search for food from waste or dead animals.

Some of the bone tools showed signs of having been hit more than ten times, suggesting careful work.

Mírian Pacheco is a researcher with the Federal University of Sao Carlos in Brazil. She was not involved in the study.

Pacheco said the newly uncovered evidence suggests early humans were thoughtful when choosing and making the bone tools. Researchers believe this because certain kinds of large and heavy leg bones were taken from specific animals. Also, the methods used to make the tools appeared to be regular, or consistent.

The researchers noted the bones showed only small signs of damage. Pacheco said she thinks this rules out the possibility that natural causes shaped the tools.

The bone tools date from more than a million years before our species, Homo sapiens, arose around 300,000 years ago.

At the time the tools were made, three different species of human ancestors lived in the same area of East Africa. That information comes from Briana Pobiner of the Smithsonian’s Human Origins Program. Pobiner was not involved in the study.

The tools may have been made and used by Homo erectus, Homo habilis or Paranthropus boisei, she said. “It could have been any of these three, but it’s almost impossible to know which one.”

I’m John Russell.
      `,
      questions: {
        create: [
          {
            questionText:
              "How long ago were the bone tools discovered in Tanzania likely used?",
            options: JSON.stringify([
              "300,000 years ago",
              "1 million years ago",
              "1.5 million years ago",
              "3.3 million years ago",
            ]),
            answer: 2,
            explanation:
              "原文：'suggests early humans commonly used animal bones to make cutting tools 1.5 million years ago'。",
          },
          {
            questionText:
              "Why do researchers believe the bone tool-making was 'thoughtful'?",
            options: JSON.stringify([
              "They used very beautiful bones",
              "Specific heavy bones were chosen regularly and consistently",
              "The tools were used as weapons in war",
              "Bone tools are much better than stone tools",
            ]),
            answer: 1,
            explanation:
              "原文：'certain kinds of large and heavy leg bones were taken from specific animals…the methods used to make the tools appeared to be regular, or consistent'。",
          },
          {
            questionText:
              "Early humans were 'scavenging' for food. What does 'scavenging' mean?",
            options: JSON.stringify([
              "Hunting large animals like elephants",
              "Searching for food from dead or waste animals",
              "Growing crops in the forest",
              "Fishing in deep rivers",
            ]),
            answer: 1,
            explanation:
              "原文直接给出定义：'Scavenging means to search for food from waste or dead animals'。",
          },
          {
            questionText:
              "What does this discovery change about our understanding of ancient humans?",
            options: JSON.stringify([
              "They only used stone to make tools",
              "They lived in Tanzania much later than we thought",
              "They had more complex tool kits than previously believed",
              "They were excellent hunters of hippos",
            ]),
            answer: 2,
            explanation:
              "Harcourt-Smith说古人类'had rather more complex tool kits than previously we thought'。",
          },
          {
            questionText:
              "Humans made simple tools from stones as early as ______ million years ago.",
            options: JSON.stringify(["1.5", "3.3", "5.0", "10"]),
            answer: 1,
            explanation:
              "原文：'our early ancestors made simple tools from stones as early as 3.3 million years ago'。",
          },
          {
            questionText:
              "The methods used to make the tools appeared to be ______, or consistent.",
            options: JSON.stringify(["random", "regular", "modern", "unknown"]),
            answer: 1,
            explanation:
              "原文：'the methods used to make the tools appeared to be regular, or consistent'。",
          },
          {
            questionText:
              "Most bone tools came from the ______ bones of large animals.",
            options: JSON.stringify(["rib", "skull", "leg", "jaw"]),
            answer: 2,
            explanation:
              "原文：'Most of them came from the leg bones of large animals such as elephants and hippos'。",
          },
        ],
      },
    },
  ];
  for (const data of dataList) {
    await prisma.listeningMaterial.create({ data });
  }
}

main();
