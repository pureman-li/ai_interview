import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Text,
  Flex,
  Container,
  IconButton,
  useToast,
  Button,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  List,
  ListItem,
  ListIcon,
  Icon,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowForwardIcon, CheckIcon } from '@chakra-ui/icons';
import { Send, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { interviewQuestions } from '../data/interviewQuestions';
import { positions, Position } from '../data/positions';
import InterviewFeedback from './InterviewFeedback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toast = useToast();

  // 计算面试进度
  const calculateProgress = () => {
    if (messages.length === 0) return 0;
    // 计算 AI 提问的次数（每两个消息为一轮对话）
    const aiQuestions = messages.filter(msg => msg.role === 'assistant').length;
    // 假设面试总共有 8 个问题
    return Math.min(Math.round((aiQuestions / 8) * 100), 100);
  };

  // 更新计时器
  useEffect(() => {
    if (interviewStartTime && !isInterviewEnded) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - interviewStartTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStartTime, isInterviewEnded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_DEEPSEEK_API_URL,
        {
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
          messages: [
            {
              role: 'system',
              content: `你是一位经验丰富的${selectedPosition?.name}面试专家。你的特点是：
1. 专业性强：对${selectedPosition?.name}领域有深入理解
2. 经验丰富：有丰富的面试经验
3. 态度友好：以友善、专业的态度进行面试
4. 注重细节：善于观察候选人的回答细节
5. 善于引导：能够通过追问深入了解候选人
6. 客观公正：基于事实和标准进行评估

面试重点：
1. 技术能力：${selectedPosition?.requirements.join('、')}
2. 专业素质：学习能力、团队协作、沟通能力等
3. 项目经验：实际项目经历和解决问题的能力

${resumeContent ? `候选人简历内容：
${resumeContent}

请根据候选人的简历内容，生成更有针对性的面试问题。` : ''}

请用中文进行面试，并遵循以下规则：
1. 每次只问一个问题
2. 问题要简洁明了
3. 根据候选人的回答调整问题难度
4. 使用 Markdown 格式输出
5. 在问题前标注"面试官："，在回答前标注"候选人："
6. 如果候选人的回答不够完整，可以追问一次，但追问后必须进入下一个问题
7. 追问规则：
   - 只针对关键点或模糊处进行追问
   - 追问要简洁明确
   - 追问后无论回答如何，都进入下一个问题
8. 面试结束时，给出详细的评估报告`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
        }
      );

      const aiMessage = response.data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: '错误',
        description: '无法连接到 AI 服务，请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSelect = async (question: string) => {
    const userMessage: Message = {
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_DEEPSEEK_API_URL,
        {
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
          messages: [
            {
              role: 'system',
              content: `你是一位经验丰富的${selectedPosition?.category || '技术'}领域面试专家，负责进行${selectedPosition?.name || '技术'}岗位的面试。请针对候选人的回答进行追问或评价，注意：
1. 追问要简洁明确，避免过于复杂
2. 每次追问只能提出一个问题
3. 追问后不要自己解答或提供答案示例
4. 使用 Markdown 格式，让问题清晰易读
5. 追问后直接等待候选人回答，不要做其他解释`
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
        }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (messages.length < 2) {
      toast({
        title: '无法生成反馈',
        description: '面试对话内容不足，无法生成有效的面试反馈',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // 清除计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsLoading(true);
    try {
      const prompt = `你是一位专业的面试反馈生成器。请根据以下面试对话内容，生成一份详细的面试反馈报告。

要求：
1. 必须严格按照 JSON 格式输出
2. 不要输出任何其他文字或解释
3. 不要包含对话内容
4. 确保 JSON 格式正确，可以被解析
5. 对每个问题的回答进行详细评价
6. 评价要客观、专业、严格
7. 指出每个回答的优点和不足
8. 给出具体的改进建议

面试对话内容：
${messages.map(msg => `${msg.role === 'assistant' ? '面试官' : '候选人'}：${msg.content}`).join('\n')}

请严格按照以下 JSON 格式输出，不要添加任何其他内容：
{
  "score": 85,
  "strengths": ["优势1", "优势2"],
  "improvements": ["建议1", "建议2"],
  "overallFeedback": "总结评价",
  "questionFeedback": [
    {
      "question": "问题1",
      "answer": "回答1",
      "score": 80,
      "strengths": ["优点1", "优点2"],
      "weaknesses": ["不足1", "不足2"],
      "suggestions": ["建议1", "建议2"]
    }
  ]
}`;

      const response = await axios.post(
        import.meta.env.VITE_DEEPSEEK_API_URL,
        {
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
          messages: [
            {
              role: 'system',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
        }
      );

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid API response');
      }

      const feedbackText = response.data.choices[0].message.content;
      console.log('Feedback Response:', feedbackText); // 添加日志
      
      // 尝试清理和解析 JSON
      let cleanedContent = feedbackText
        .replace(/```json\n?|\n?```/g, '') // 移除 markdown 代码块
        .replace(/^\s*\[|\]\s*$/g, '') // 移除可能的数组包装
        .trim();

      // 尝试提取 JSON 对象
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      // 尝试修复常见的 JSON 格式问题
      cleanedContent = cleanedContent
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // 给属性名添加引号
        .replace(/'/g, '"') // 将单引号替换为双引号
        .replace(/,\s*([}\]])/g, '$1'); // 移除尾随逗号

      console.log('Cleaned content:', cleanedContent);
      
      // 尝试解析 JSON
      try {
        const feedback = JSON.parse(cleanedContent);
        setFeedback(feedback);
        setShowFeedback(true);
        setIsInterviewEnded(true);
      } catch (error) {
        console.error('Error parsing feedback:', error);
        throw new Error('Invalid feedback format');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast({
        title: '生成反馈失败',
        description: '无法生成面试反馈，请稍后重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartInterview = () => {
    setMessages([]);
    setInput('');
    setShowFeedback(false);
    setFeedback(null);
    setIsInterviewEnded(false);
    setInterviewStartTime(new Date());
    setElapsedTime('00:00:00');
  };

  const handlePositionSelect = async (position: Position | null) => {
    if (position) {
      setSelectedPosition(position);
      setMessages([]); // 清空之前的对话
      setInterviewStartTime(new Date()); // 设置面试开始时间
      setIsLoading(true);
      try {
        const prompt = `你现在是一位专业的${position.name}面试官。请严格按照以下要求进行面试：

1. 面试风格：
   - 保持专业、友好的态度
   - 每次只提出一个问题，等待候选人回答后再继续
   - 根据候选人的回答进行追问或提出下一个问题
   - 问题难度要循序渐进，从基础到深入

2. 面试流程：
   - 首先进行简短的自我介绍
   - 然后开始提问，每次只问一个问题
   - 根据候选人的回答进行追问或提出下一个问题
   - 面试结束时给出总结性评价

3. 注意事项：
   - 不要一次性提出多个问题
   - 不要提前给出答案
   - 不要自问自答
   - 不要在没有候选人回答的情况下进行追问
   - 保持对话的自然流畅
   - 关注候选人的实际能力和经验

${resumeContent ? `候选人简历内容：
${resumeContent}

请根据候选人的简历内容，生成更有针对性的面试问题。` : ''}

请严格按照以下格式输出：
1. 首先进行简短的自我介绍（不超过 2 句话）
2. 然后提出第一个问题（只问一个问题，不要自问自答，不要追问）
3. 等待候选人回答后再继续

注意：这是面试的开始，只需要自我介绍和提出一个问题，不要进行追问或自问自答。`;

        const response = await axios.post(
          import.meta.env.VITE_DEEPSEEK_API_URL,
          {
            model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
            messages: [
              {
                role: 'system',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
            },
          }
        );

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
          throw new Error('Invalid API response');
        }

        const aiMessage = response.data.choices[0].message.content;
        console.log('AI Response:', aiMessage); // 添加日志
        setMessages([{ role: 'assistant', content: aiMessage }]);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: '错误',
          description: '无法连接到 AI 服务，请稍后重试',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setSelectedPosition(null);
      setResumeContent('');
      setInterviewStartTime(null);
      setElapsedTime('00:00:00');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: '文件格式不支持',
          description: '请上传 PDF 或 Word 文档',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // 检查文件大小（限制为 10MB）
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '请上传小于 10MB 的文件',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setResumeFile(file);
      
      // 读取文件内容
      try {
        const text = await file.text();
        setResumeContent(text);
        toast({
          title: '简历上传成功',
          description: `已上传并分析: ${file.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          title: '简历分析失败',
          description: '无法读取文件内容，请确保文件格式正确',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: '简历已移除',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Tabs>
        <TabList>
          <Tab>AI面试官</Tab>
          <Tab>问题模板</Tab>
          <Tab>面试反馈</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            {!selectedPosition ? (
              <VStack spacing={6} align="stretch">
                <Text fontSize="xl" fontWeight="bold">请选择面试职位</Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {positions.map((position) => (
                    <Box
                      key={position.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      cursor="pointer"
                      onClick={() => handlePositionSelect(position)}
                      _hover={{ borderColor: 'blue.500' }}
                    >
                      <Text fontSize="lg" fontWeight="bold">{position.name}</Text>
                      <Text color="gray.600" mt={2}>{position.description}</Text>
                      <Text fontSize="sm" color="gray.500" mt={2}>要求：</Text>
                      <List spacing={1}>
                        {position.requirements.map((req, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={CheckIcon} color="green.500" />
                            {req}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch" h="calc(100vh - 200px)">
                <Flex justify="space-between" align="center">
                  <Text fontSize="xl" fontWeight="bold">
                    面试职位：{selectedPosition.name}
                  </Text>
                  <HStack>
                    <Button
                      leftIcon={<Icon as={Upload} />}
                      onClick={onOpen}
                      colorScheme="blue"
                      variant="outline"
                    >
                      {resumeFile ? '更换简历' : '上传简历'}
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => handlePositionSelect(null)}
                    >
                      更换职位
                    </Button>
                  </HStack>
                </Flex>

                {/* 面试进度和计时器 */}
                <Box p={4} bg="gray.50" borderRadius="lg">
                  <VStack spacing={2} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium">面试进度</Text>
                      <Text fontWeight="medium">用时：{elapsedTime}</Text>
                    </Flex>
                    <Box w="100%" h="4px" bg="gray.200" borderRadius="full">
                      <Box
                        w={`${calculateProgress()}%`}
                        h="100%"
                        bg="blue.500"
                        borderRadius="full"
                        transition="width 0.3s ease"
                      />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      已完成 {calculateProgress()}%
                    </Text>
                  </VStack>
                </Box>

                {/* 简历上传模态框 */}
                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>上传简历</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <VStack spacing={4}>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                          display="none"
                          id="resume-upload"
                        />
                        <Button
                          as="label"
                          htmlFor="resume-upload"
                          colorScheme="blue"
                          cursor="pointer"
                        >
                          选择文件
                        </Button>
                        {resumeFile && (
                          <Box w="100%">
                            <Text>已选择: {resumeFile.name}</Text>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={handleRemoveResume}
                              mt={2}
                            >
                              移除
                            </Button>
                          </Box>
                        )}
                        <Text fontSize="sm" color="gray.500">
                          支持 PDF、Word 格式，大小不超过 10MB
                        </Text>
                      </VStack>
                    </ModalBody>
                  </ModalContent>
                </Modal>

                {/* 聊天界面 */}
                <Box
                  flex={1}
                  overflowY="auto"
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  bg="gray.50"
                >
                  {messages.map((message, index) => (
                    <Flex
                      key={index}
                      justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                      mb={4}
                    >
                      <Box
                        maxW="90%"
                        bg={message.role === 'user' ? 'blue.500' : 'gray.50'}
                        color={message.role === 'user' ? 'white' : 'black'}
                        p={3}
                        borderRadius="lg"
                        boxShadow="sm"
                        textAlign={message.role === 'user' ? 'right' : 'left'}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <Text mb={2} textAlign="inherit" color="inherit">{children}</Text>,
                            ul: ({ children }) => <List spacing={1} mb={2} textAlign="inherit" color="inherit">{children}</List>,
                            ol: ({ children }) => <List spacing={1} mb={2} styleType="decimal" textAlign="inherit" color="inherit">{children}</List>,
                            li: ({ children }) => <ListItem textAlign="inherit" color="inherit">{children}</ListItem>,
                            h1: ({ children }) => <Text fontSize="xl" fontWeight="bold" mb={2} textAlign="inherit" color="inherit">{children}</Text>,
                            h2: ({ children }) => <Text fontSize="lg" fontWeight="bold" mb={2} textAlign="inherit" color="inherit">{children}</Text>,
                            h3: ({ children }) => <Text fontSize="md" fontWeight="bold" mb={2} textAlign="inherit" color="inherit">{children}</Text>,
                            blockquote: ({ children }) => (
                              <Box
                                borderLeft="4px solid"
                                borderColor={message.role === 'user' ? 'whiteAlpha.400' : 'gray.300'}
                                pl={4}
                                my={2}
                                color="inherit"
                                textAlign="inherit"
                              >
                                {children}
                              </Box>
                            ),
                            code: ({ children }) => (
                              <Box
                                bg={message.role === 'user' ? 'whiteAlpha.200' : 'gray.100'}
                                p={1}
                                borderRadius="md"
                                fontFamily="mono"
                                fontSize="sm"
                                textAlign="inherit"
                                color="inherit"
                              >
                                {children}
                              </Box>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </Box>
                    </Flex>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* 输入框 */}
                <InputGroup>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入你的回答..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <InputRightElement>
                    <Button
                      colorScheme="blue"
                      onClick={handleSend}
                      isLoading={isLoading}
                      isDisabled={!input.trim()}
                    >
                      <Icon as={Send} />
                    </Button>
                  </InputRightElement>
                </InputGroup>

                {/* 结束面试按钮 */}
                <Button
                  colorScheme={isInterviewEnded ? "green" : "red"}
                  onClick={isInterviewEnded ? handleRestartInterview : handleEndInterview}
                  isDisabled={messages.length === 0}
                >
                  {isInterviewEnded ? "重新开始" : "结束面试"}
                </Button>
              </VStack>
            )}
          </TabPanel>
          
          <TabPanel p={0}>
            <VStack align="stretch" spacing={4}>
              <Select
                placeholder="选择问题类别"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {Array.from(new Set(interviewQuestions.map(q => q.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              
              <Box overflowY="auto" maxH="calc(100vh - 200px)">
                {interviewQuestions
                  .filter(q => !selectedCategory || q.category === selectedCategory)
                  .map(question => (
                    <Box
                      key={question.id}
                      p={4}
                      mb={4}
                      bg="white"
                      borderRadius="md"
                      boxShadow="sm"
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleQuestionSelect(question.question)}
                    >
                      <Text fontWeight="bold">{question.question}</Text>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        提示：{question.tips.join(' | ')}
                      </Text>
                    </Box>
                  ))}
              </Box>
            </VStack>
          </TabPanel>
          
          <TabPanel p={0}>
            {showFeedback && feedback ? (
              <InterviewFeedback
                score={feedback.score}
                strengths={feedback.strengths}
                improvements={feedback.improvements}
                overallFeedback={feedback.overallFeedback}
              />
            ) : (
              <Text>请先完成面试对话</Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Chat; 