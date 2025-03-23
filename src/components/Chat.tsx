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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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

    setIsLoading(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_DEEPSEEK_API_URL,
        {
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
          messages: [
            {
              role: 'system',
              content: `你是一位经验丰富的${selectedPosition?.name}面试专家，请根据整个面试过程对候选人进行专业评价。

请严格按照以下 JSON 格式输出评价，不要包含任何其他文字或解释：

{
  "score": 85,
  "strengths": ["优势1", "优势2", "优势3"],
  "improvements": ["建议1", "建议2", "建议3"],
  "overallFeedback": "总体评价内容"
}

评价要求：
1. score: 0-100 的整数，基于候选人的整体表现
2. strengths: 数组，列出候选人的主要优势，每个优势要具体且有实例支撑
3. improvements: 数组，列出需要改进的地方，建议要具体且可执行
4. overallFeedback: 字符串，对候选人进行全面的总结，评价要客观、专业、有建设性

注意：
- 必须严格按照上述 JSON 格式输出
- 不要添加任何其他文字或解释
- 确保 JSON 格式正确，可以被解析
- 所有字段都必须存在且格式正确
- 如果面试内容不足，无法生成有效评价，请返回 null`
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
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

      const feedbackContent = response.data.choices[0].message.content;
      console.log('Raw feedback content:', feedbackContent);

      try {
        // 尝试清理和解析 JSON
        let cleanedContent = feedbackContent
          .replace(/```json\n?|\n?```/g, '') // 移除 markdown 代码块
          .replace(/^\s*\[|\]\s*$/g, '') // 移除可能的数组包装
          .trim();

        // 尝试提取 JSON 对象
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }

        console.log('Cleaned content:', cleanedContent);

        // 尝试修复常见的 JSON 格式问题
        cleanedContent = cleanedContent
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // 给属性名添加引号
          .replace(/'/g, '"') // 将单引号替换为双引号
          .replace(/,\s*([}\]])/g, '$1'); // 移除尾随逗号

        console.log('Fixed content:', cleanedContent);

        // 检查是否为 null
        if (cleanedContent.toLowerCase() === 'null') {
          throw new Error('面试内容不足，无法生成有效评价');
        }

        const parsedFeedback = JSON.parse(cleanedContent);
        
        // 验证反馈数据的完整性
        if (!parsedFeedback.score || !parsedFeedback.strengths || !parsedFeedback.improvements || !parsedFeedback.overallFeedback) {
          console.error('Invalid feedback structure:', parsedFeedback);
          throw new Error('反馈数据不完整');
        }

        // 验证数据类型
        if (typeof parsedFeedback.score !== 'number' ||
            !Array.isArray(parsedFeedback.strengths) ||
            !Array.isArray(parsedFeedback.improvements) ||
            typeof parsedFeedback.overallFeedback !== 'string') {
          console.error('Invalid data types:', parsedFeedback);
          throw new Error('反馈数据格式不正确');
        }
        
        setFeedback(parsedFeedback);
        setShowFeedback(true);
        setIsInterviewEnded(true);
        toast({
          title: '面试结束',
          description: '本次面试已结束，请前往面试反馈查询面试结果',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Failed to parse feedback:', error);
        console.error('Original content:', feedbackContent);
        toast({
          title: '反馈生成失败',
          description: error instanceof Error ? error.message : '无法生成有效的面试反馈，请稍后重试',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    } catch (error) {
      console.error('API call failed:', error);
      toast({
        title: '反馈生成失败',
        description: '服务器连接失败，请检查网络后重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartInterview = () => {
    setMessages([]);
    setShowFeedback(false);
    setIsInterviewEnded(false);
    setSelectedPosition(null);
    setFeedback(null);
  };

  const handlePositionSelect = async (position: Position | null) => {
    if (position) {
      setSelectedPosition(position);
      setMessages([]); // 清空之前的对话
      setIsLoading(true);
      try {
        const response = await axios.post(
          import.meta.env.VITE_DEEPSEEK_API_URL,
          {
            model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
            messages: [
              {
                role: 'system',
                content: `你是一位经验丰富的${position.name}面试专家。你的特点是：
1. 专业性强：对${position.name}领域有深入理解
2. 经验丰富：有丰富的面试经验
3. 态度友好：以友善、专业的态度进行面试
4. 注重细节：善于观察候选人的回答细节
5. 善于引导：能够通过追问深入了解候选人
6. 客观公正：基于事实和标准进行评估

面试重点：
1. 技术能力：${position.requirements.join('、')}
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
8. 面试结束时，给出详细的评估报告

现在，请先进行自我介绍，然后提出第一个问题。注意：
1. 自我介绍要简洁专业，说明你是 AI 面试官
2. 只提出一个问题，不要生成答案
3. 问题要针对${position.name}岗位的核心要求
4. 使用 Markdown 格式，让问题清晰易读
5. 严格禁止在提问后自问自答或提供答案示例
6. 提问后直接等待候选人回答`
              }
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