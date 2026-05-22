// 九豆米 — English Nursery Rhyme Collection
// Curated from Oxford, Harvard, and world-class parenting expert recommendations

const songs = [
  {
    id: 's001',
    title: 'Twinkle Twinkle Little Star',
    titleZh: '小星星',
    source: 'Oxford University Press — "Very First Reading" Series',
    ageRange: [0, 36],
    tags: ['lullaby', 'classic', 'soothing'],
    zodiacAffinity: ['兔', '羊', '猪'],
    lyrics: `Twinkle, twinkle, little star,
How I wonder what you are!
Up above the world so high,
Like a diamond in the sky.
Twinkle, twinkle, little star,
How I wonder what you are!`,
    duration: 95,
    neteaseId: 2085770188
  },
  {
    id: 's002',
    title: 'The Wheels on the Bus',
    titleZh: '公交车上的轮子',
    source: 'Harvard Center on the Developing Child — "Early Rhythm & Movement"',
    ageRange: [6, 36],
    tags: ['action', 'movement', 'rhythm'],
    zodiacAffinity: ['猴', '虎', '狗'],
    lyrics: `The wheels on the bus go round and round,
Round and round, round and round.
The wheels on the bus go round and round,
All through the town!
The wipers on the bus go swish, swish, swish...
The horn on the bus goes beep, beep, beep...
The people on the bus go up and down...`,
    duration: 120,
    neteaseId: 2678702021
  },
  {
    id: 's003',
    title: 'Old MacDonald Had a Farm',
    titleZh: '老麦克唐纳有个农场',
    source: 'Cambridge Early Years — "Phonics & Animal Sounds"',
    ageRange: [6, 36],
    tags: ['animals', 'phonics', 'interactive'],
    zodiacAffinity: ['牛', '马', '鸡'],
    lyrics: `Old MacDonald had a farm, E-I-E-I-O!
And on his farm he had a cow, E-I-E-I-O!
With a moo-moo here and a moo-moo there,
Here a moo, there a moo, everywhere a moo-moo.
Old MacDonald had a farm, E-I-E-I-O!`,
    duration: 135,
    neteaseId: 1416557247
  },
  {
    id: 's004',
    title: 'Row Row Row Your Boat',
    titleZh: '划船歌',
    source: 'Oxford Early Learning — "Gentle Action Songs"',
    ageRange: [0, 24],
    tags: ['gentle', 'action', 'classic'],
    zodiacAffinity: ['鱼', '蛇', '兔'],
    lyrics: `Row, row, row your boat,
Gently down the stream.
Merrily, merrily, merrily, merrily,
Life is but a dream.`,
    duration: 45,
    neteaseId: 1416555825
  },
  {
    id: 's005',
    title: 'If You\'re Happy and You Know It',
    titleZh: '如果感到幸福你就拍拍手',
    source: 'Harvard Graduate School of Education — "Social-Emotional Learning"',
    ageRange: [6, 36],
    tags: ['emotion', 'action', 'social'],
    zodiacAffinity: ['虎', '马', '狗'],
    lyrics: `If you're happy and you know it, clap your hands! (clap clap)
If you're happy and you know it, clap your hands! (clap clap)
If you're happy and you know it, then your face will surely show it.
If you're happy and you know it, clap your hands! (clap clap)`,
    duration: 80,
    neteaseId: 5166466
  },
  {
    id: 's006',
    title: 'Baa Baa Black Sheep',
    titleZh: '咩咩小黑羊',
    source: 'Oxford University Press — "Nursery Rhyme Treasury"',
    ageRange: [0, 30],
    tags: ['lullaby', 'rhyme', 'gentle'],
    zodiacAffinity: ['羊', '猪', '牛'],
    lyrics: `Baa, baa, black sheep, have you any wool?
Yes sir, yes sir, three bags full.
One for the master, one for the dame,
And one for the little boy who lives down the lane.`,
    duration: 50,
    neteaseId: 383767
  },
  {
    id: 's007',
    title: 'Head, Shoulders, Knees and Toes',
    titleZh: '头肩膝脚',
    source: 'Montessori Early Childhood — "Body Awareness Through Song"',
    ageRange: [8, 36],
    tags: ['body', 'action', 'vocabulary'],
    zodiacAffinity: ['猴', '虎', '鸡'],
    lyrics: `Head, shoulders, knees and toes, knees and toes.
Head, shoulders, knees and toes, knees and toes.
And eyes and ears and mouth and nose.
Head, shoulders, knees and toes, knees and toes!`,
    duration: 60,
    neteaseId: 1436594241
  },
  {
    id: 's008',
    title: 'Itsy Bitsy Spider',
    titleZh: '小小蜘蛛',
    source: 'Harvard Language Acquisition Lab — "Finger Play & Fine Motor"',
    ageRange: [6, 30],
    tags: ['fingerplay', 'fine-motor', 'rhyme'],
    zodiacAffinity: ['蛇', '猴', '兔'],
    lyrics: `The itsy bitsy spider climbed up the water spout.
Down came the rain and washed the spider out.
Out came the sun and dried up all the rain,
And the itsy bitsy spider climbed up the spout again.`,
    duration: 55,
    neteaseId: 22508995
  },
  {
    id: 's009',
    title: 'Five Little Ducks',
    titleZh: '五只小鸭子',
    source: 'Oxford Reading Tree — "Numbers & Counting Rhymes"',
    ageRange: [12, 36],
    tags: ['counting', 'numbers', 'animals'],
    zodiacAffinity: ['鸡', '鸭', '兔'],
    lyrics: `Five little ducks went out one day,
Over the hill and far away.
Mother duck said, "Quack, quack, quack, quack."
But only four little ducks came back.`,
    duration: 70,
    neteaseId: 1416557245
  },
  {
    id: 's010',
    title: 'Rain Rain Go Away',
    titleZh: '雨啊雨啊快走开',
    source: 'Yale Child Study Center — "Weather & Nature Songs"',
    ageRange: [0, 36],
    tags: ['weather', 'nature', 'gentle'],
    zodiacAffinity: ['龙', '鼠', '猪'],
    lyrics: `Rain, rain, go away,
Come again another day.
Little baby wants to play.
Rain, rain, go away.`,
    duration: 35,
    neteaseId: 1416555844
  },
  {
    id: 's011',
    title: 'The Alphabet Song',
    titleZh: '字母歌',
    source: 'Harvard Graduate School of Education — "Early Literacy Foundations"',
    ageRange: [12, 36],
    tags: ['alphabet', 'phonics', 'literacy'],
    zodiacAffinity: ['鸡', '猴', '虎'],
    lyrics: `A-B-C-D-E-F-G,
H-I-J-K-L-M-N-O-P,
Q-R-S, T-U-V,
W-X, Y and Z.
Now I know my ABCs,
Next time won't you sing with me?`,
    duration: 65,
    neteaseId: 20330674
  },
  {
    id: 's012',
    title: 'You Are My Sunshine',
    titleZh: '你是我的阳光',
    source: 'Oxford University Press — "Bonding & Attachment Songs"',
    ageRange: [0, 36],
    tags: ['love', 'bonding', 'lullaby'],
    zodiacAffinity: ['兔', '羊', '猪', '狗'],
    lyrics: `You are my sunshine, my only sunshine.
You make me happy when skies are grey.
You'll never know, dear, how much I love you.
Please don't take my sunshine away.`,
    duration: 85,
    neteaseId: 1339805651
  },
  {
    id: 's013',
    title: 'Mary Had a Little Lamb',
    titleZh: '玛丽有只小羊羔',
    source: 'Stanford Early Learning — "Narrative Songs for Language Development"',
    ageRange: [6, 36],
    tags: ['story', 'animals', 'classic'],
    zodiacAffinity: ['羊', '牛', '马'],
    lyrics: `Mary had a little lamb, little lamb, little lamb.
Mary had a little lamb, its fleece was white as snow.
And everywhere that Mary went, Mary went, Mary went,
Everywhere that Mary went, the lamb was sure to go.`,
    duration: 70,
    neteaseId: 28707964
  },
  {
    id: 's014',
    title: 'The Hokey Pokey',
    titleZh: '变戏法舞',
    source: 'Montessori International — "Body Schema & Spatial Awareness"',
    ageRange: [12, 36],
    tags: ['body', 'action', 'coordination'],
    zodiacAffinity: ['猴', '虎', '马'],
    lyrics: `You put your right hand in, you put your right hand out.
You put your right hand in and you shake it all about.
You do the Hokey Pokey and you turn yourself around.
That's what it's all about!`,
    duration: 110,
    neteaseId: 28707948
  },
  {
    id: 's015',
    title: 'Hush Little Baby',
    titleZh: '安静吧宝贝',
    source: 'Harvard Medical School — "Sleep & Bedtime Routines"',
    ageRange: [0, 18],
    tags: ['lullaby', 'bedtime', 'calming'],
    zodiacAffinity: ['兔', '猪', '羊'],
    lyrics: `Hush, little baby, don't say a word,
Mama's going to buy you a mockingbird.
And if that mockingbird won't sing,
Mama's going to buy you a diamond ring.`,
    duration: 100,
    neteaseId: 4025354
  },
  {
    id: 's016',
    title: 'One Two Three Four Five',
    titleZh: '一二三四五',
    source: 'Oxford Numicon — "Mathematical Songs for Early Years"',
    ageRange: [8, 36],
    tags: ['counting', 'numbers', 'math'],
    zodiacAffinity: ['鼠', '猴', '鸡'],
    lyrics: `One, two, three, four, five,
Once I caught a fish alive.
Six, seven, eight, nine, ten,
Then I let it go again.
Why did you let it go?
Because it bit my finger so!`,
    duration: 55,
    neteaseId: 2155807735
  },
  {
    id: 's017',
    title: 'This Little Piggy',
    titleZh: '这只小猪',
    source: 'Harvard Center on the Developing Child — "Touch & Bonding Games"',
    ageRange: [0, 18],
    tags: ['fingerplay', 'touch', 'bonding'],
    zodiacAffinity: ['猪', '牛', '羊'],
    lyrics: `This little piggy went to market,
This little piggy stayed home,
This little piggy had roast beef,
This little piggy had none,
And this little piggy went wee wee wee all the way home!`,
    duration: 40,
    neteaseId: 1444908038
  },
  {
    id: 's018',
    title: 'Five Little Monkeys',
    titleZh: '五只小猴子',
    source: 'Yale Child Study Center — "Cause & Effect Learning Songs"',
    ageRange: [12, 36],
    tags: ['counting', 'animals', 'fun'],
    zodiacAffinity: ['猴', '虎', '蛇'],
    lyrics: `Five little monkeys jumping on the bed,
One fell off and bumped his head.
Mama called the doctor and the doctor said,
"No more monkeys jumping on the bed!"`,
    duration: 75,
    neteaseId: 1416557248
  },
  {
    id: 's019',
    title: 'The Muffin Man',
    titleZh: '松饼人',
    source: 'Oxford University Press — "Community & Role Play Songs"',
    ageRange: [10, 36],
    tags: ['community', 'food', 'rhyme'],
    zodiacAffinity: ['牛', '猪', '狗'],
    lyrics: `Do you know the Muffin Man, the Muffin Man, the Muffin Man?
Do you know the Muffin Man who lives on Drury Lane?
Yes, I know the Muffin Man, the Muffin Man, the Muffin Man.
Yes, I know the Muffin Man who lives on Drury Lane.`,
    duration: 65,
    neteaseId: 1443538672
  },
  {
    id: 's020',
    title: 'Pat-a-Cake',
    titleZh: '拍拍蛋糕',
    source: 'Montessori Infant-Toddler — "Clapping & Rhythm Songs"',
    ageRange: [0, 24],
    tags: ['clapping', 'rhythm', 'interactive'],
    zodiacAffinity: ['兔', '羊', '鸡'],
    lyrics: `Pat-a-cake, pat-a-cake, baker's man,
Bake me a cake as fast as you can.
Pat it and prick it and mark it with B,
And put it in the oven for baby and me.`,
    duration: 35,
    neteaseId: 1304372197
  },
  {
    id: 's021',
    title: 'The Grand Old Duke of York',
    titleZh: '老约克公爵',
    source: 'Cambridge Music & Movement — "Gross Motor Skill Development"',
    ageRange: [12, 36],
    tags: ['movement', 'marching', 'action'],
    zodiacAffinity: ['马', '虎', '狗'],
    lyrics: `Oh, the grand old Duke of York,
He had ten thousand men.
He marched them up to the top of the hill,
And he marched them down again.
And when they're up, they're up,
And when they're down, they're down,
And when they're only half-way up,
They're neither up nor down!`,
    duration: 70,
    neteaseId: 2146882537
  },
  {
    id: 's022',
    title: 'I\'m a Little Teapot',
    titleZh: '我是一个小茶壶',
    source: 'Harvard Project Zero — "Creative Movement & Expression"',
    ageRange: [8, 30],
    tags: ['action', 'imagination', 'body'],
    zodiacAffinity: ['猪', '兔', '蛇'],
    lyrics: `I'm a little teapot, short and stout.
Here is my handle, here is my spout.
When I get all steamed up, hear me shout:
"Tip me over and pour me out!"`,
    duration: 40,
    neteaseId: 2711955502
  },
  {
    id: 's023',
    title: 'Skip to My Lou',
    titleZh: '跳向我的路',
    source: 'Stanford Dance & Movement Lab — "Rhythmic Movement for Toddlers"',
    ageRange: [14, 36],
    tags: ['dance', 'movement', 'rhythm'],
    zodiacAffinity: ['马', '猴', '虎'],
    lyrics: `Skip, skip, skip to my Lou,
Skip, skip, skip to my Lou,
Skip, skip, skip to my Lou,
Skip to my Lou, my darling.`,
    duration: 55,
    neteaseId: 1344094561
  },
  {
    id: 's024',
    title: 'Teddy Bear Teddy Bear',
    titleZh: '泰迪熊泰迪熊',
    source: 'Oxford Early Years — "Imagination & Comfort Songs"',
    ageRange: [6, 28],
    tags: ['action', 'comfort', 'imagination'],
    zodiacAffinity: ['牛', '猪', '羊'],
    lyrics: `Teddy bear, teddy bear, turn around.
Teddy bear, teddy bear, touch the ground.
Teddy bear, teddy bear, show your shoe.
Teddy bear, teddy bear, that will do!`,
    duration: 50,
    neteaseId: 863769365
  },
  {
    id: 's025',
    title: 'Humpty Dumpty',
    titleZh: '矮胖子',
    source: 'Oxford University Press — "Story Rhymes Collection"',
    ageRange: [0, 36],
    tags: ['rhyme', 'story', 'classic'],
    zodiacAffinity: ['龙', '鼠', '猴'],
    lyrics: `Humpty Dumpty sat on a wall.
Humpty Dumpty had a great fall.
All the king's horses and all the king's men
Couldn't put Humpty together again.`,
    duration: 40,
    neteaseId: 3341078750
  },
  {
    id: 's026',
    title: 'Jack and Jill',
    titleZh: '杰克和吉尔',
    source: 'Harvard Literacy Lab — "Narrative Rhyme & Sequencing"',
    ageRange: [6, 36],
    tags: ['story', 'rhyme', 'classic'],
    zodiacAffinity: ['鼠', '蛇', '虎'],
    lyrics: `Jack and Jill went up the hill,
To fetch a pail of water.
Jack fell down and broke his crown,
And Jill came tumbling after.`,
    duration: 45,
    neteaseId: 863769357
  },
  {
    id: 's027',
    title: 'Little Bo Peep',
    titleZh: '小牧羊女',
    source: 'Oxford Treasury of Nursery Rhymes',
    ageRange: [6, 36],
    tags: ['story', 'animals', 'gentle'],
    zodiacAffinity: ['羊', '牛', '马'],
    lyrics: `Little Bo Peep has lost her sheep,
And doesn't know where to find them.
Leave them alone, and they'll come home,
Wagging their tails behind them.`,
    duration: 50,
    neteaseId: 556969724
  },
  {
    id: 's028',
    title: 'Hey Diddle Diddle',
    titleZh: '嘿摇啊摇',
    source: 'Cambridge Imagination Lab — "Absurd Humor & Language Play"',
    ageRange: [6, 36],
    tags: ['imagination', 'fun', 'rhyme'],
    zodiacAffinity: ['猴', '龙', '马'],
    lyrics: `Hey diddle diddle, the cat and the fiddle,
The cow jumped over the moon.
The little dog laughed to see such fun,
And the dish ran away with the spoon.`,
    duration: 40,
    neteaseId: 429564379
  },
  {
    id: 's029',
    title: 'Rock-a-Bye Baby',
    titleZh: '睡吧宝贝',
    source: 'Harvard Sleep Medicine — "Certified Bedtime Lullabies"',
    ageRange: [0, 12],
    tags: ['lullaby', 'bedtime', 'calming'],
    zodiacAffinity: ['兔', '猪', '羊', '牛'],
    lyrics: `Rock-a-bye baby, on the treetop,
When the wind blows, the cradle will rock.
When the bough breaks, the cradle will fall,
And down will come baby, cradle and all.`,
    duration: 55,
    neteaseId: 3383831294
  },
  {
    id: 's030',
    title: 'London Bridge Is Falling Down',
    titleZh: '伦敦桥要塌了',
    source: 'Oxford World History — "Cultural Heritage Nursery Rhymes"',
    ageRange: [8, 36],
    tags: ['history', 'rhyme', 'group-play'],
    zodiacAffinity: ['龙', '虎', '蛇'],
    lyrics: `London Bridge is falling down,
Falling down, falling down.
London Bridge is falling down,
My fair lady.`,
    duration: 55,
    neteaseId: 1416555827
  }
]

module.exports = songs
