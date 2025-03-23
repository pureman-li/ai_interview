import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  List,
  ListItem,
  ListIcon,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

interface FeedbackProps {
  score: number;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

const InterviewFeedback: React.FC<FeedbackProps> = ({
  score,
  strengths,
  improvements,
  overallFeedback,
}) => {
  return (
    <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            面试评分
          </Text>
          <Badge colorScheme={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}>
            {score}分
          </Badge>
        </HStack>
        
        <Progress value={score} colorScheme={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'} />
        
        <Divider />
        
        <Box>
          <Text fontWeight="bold" mb={2}>优势</Text>
          <List spacing={2}>
            {strengths.map((strength, index) => (
              <ListItem key={index}>
                <ListIcon as={CheckIcon} color="green.500" />
                {strength}
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Box>
          <Text fontWeight="bold" mb={2}>需要改进的地方</Text>
          <List spacing={2}>
            {improvements.map((improvement, index) => (
              <ListItem key={index}>
                <ListIcon as={CheckIcon} color="orange.500" />
                {improvement}
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Box>
          <Text fontWeight="bold" mb={2}>总体评价</Text>
          <Text>{overallFeedback}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default InterviewFeedback; 