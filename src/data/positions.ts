export interface Position {
  id: string;
  name: string;
  category: string;
  description: string;
  requirements: string[];
}

export const positions: Position[] = [
  {
    id: 'frontend',
    name: '前端开发工程师',
    category: '技术',
    description: '负责公司产品的前端开发工作，包括用户界面开发、性能优化等。',
    requirements: [
      '熟练掌握 HTML5, CSS3, JavaScript',
      '熟悉 React, Vue 等主流前端框架',
      '了解前端工程化和构建工具',
      '具备良好的代码风格和编程习惯',
      '有良好的团队协作能力'
    ]
  },
  {
    id: 'backend',
    name: '后端开发工程师',
    category: '技术',
    description: '负责公司产品的后端开发工作，包括服务器端逻辑开发、数据库设计等。',
    requirements: [
      '熟练掌握 Java, Python, Go 等后端语言',
      '熟悉 MySQL, MongoDB 等数据库',
      '了解微服务架构和分布式系统',
      '具备良好的代码风格和编程习惯',
      '有良好的团队协作能力'
    ]
  },
  {
    id: 'fullstack',
    name: '全栈开发工程师',
    category: '技术',
    description: '负责公司产品的全栈开发工作，包括前端和后端的开发工作。',
    requirements: [
      '熟练掌握前端和后端技术栈',
      '熟悉主流框架和工具',
      '了解系统架构和设计模式',
      '具备良好的代码风格和编程习惯',
      '有良好的团队协作能力'
    ]
  },
  {
    id: 'algorithm',
    name: '算法工程师',
    category: '技术',
    description: '负责公司产品的算法设计和优化工作，包括机器学习模型开发等。',
    requirements: [
      '熟练掌握数据结构和算法',
      '熟悉机器学习框架和工具',
      '了解深度学习技术',
      '具备良好的数学基础',
      '有良好的团队协作能力'
    ]
  },
  {
    id: 'product',
    name: '产品经理',
    category: '产品',
    description: '负责公司产品的规划和设计工作，包括需求分析、产品设计等。',
    requirements: [
      '熟悉产品开发流程',
      '具备良好的需求分析能力',
      '了解用户体验设计',
      '具备良好的沟通能力',
      '有良好的团队协作能力'
    ]
  },
  {
    id: 'operation',
    name: '互联网运营',
    category: '运营',
    description: '负责公司产品的运营工作，包括内容运营、用户运营、活动运营等。',
    requirements: [
      '熟悉互联网运营方法论',
      '具备内容策划和编辑能力',
      '了解用户增长和留存策略',
      '具备数据分析和优化能力',
      '有良好的沟通和协调能力',
      '了解新媒体运营和社群运营',
      '具备活动策划和执行能力'
    ]
  }
]; 