export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  tips: string[];
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: '1',
    category: '自我介绍',
    question: '请简单介绍一下你自己。',
    tips: [
      '突出你的教育背景和工作经验',
      '强调与应聘职位相关的技能和成就',
      '保持简洁，控制在2-3分钟内'
    ]
  },
  {
    id: '2',
    category: '技术能力',
    question: '你最擅长的编程语言是什么？为什么？',
    tips: [
      '结合具体项目经验说明',
      '展示对该语言的深入理解',
      '说明该语言的优势和适用场景'
    ]
  },
  {
    id: '3',
    category: '项目经验',
    question: '请描述一个你最有挑战性的项目经验。',
    tips: [
      '说明项目背景和目标',
      '描述你遇到的具体挑战',
      '解释你如何解决问题',
      '分享项目成果和收获'
    ]
  },
  {
    id: '4',
    category: '团队协作',
    question: '你如何处理团队中的分歧？',
    tips: [
      '展示沟通能力',
      '强调团队合作精神',
      '说明如何达成共识'
    ]
  },
  {
    id: '5',
    category: '职业规划',
    question: '你未来3-5年的职业规划是什么？',
    tips: [
      '结合公司发展机会',
      '展示个人成长意愿',
      '说明如何为公司创造价值'
    ]
  }
]; 