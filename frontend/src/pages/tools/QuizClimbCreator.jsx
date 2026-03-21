import { useState } from 'react';
import {
  Box, Heading, Input, Textarea, Button, VStack, HStack, FormLabel,
  FormControl, NumberInput, NumberInputField, Checkbox, Text, Divider,
  IconButton, Select, Badge,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

const EMPTY_ANSWER = () => ({ answer: '', correct: false });
const EMPTY_QUESTION = () => ({
  question: '', questionType: 'multipleChoice', stars: 1, topic: '',
  iconIndex: 0, funFact: '', answers: [EMPTY_ANSWER(), EMPTY_ANSWER(), EMPTY_ANSWER(), EMPTY_ANSWER()],
});
const EMPTY_LEVEL = () => ({ questions: [EMPTY_QUESTION()] });

export default function QuizClimbCreator() {
  const [theme, setTheme] = useState('');
  const [gameDate, setGameDate] = useState('');
  const [startingChips, setStartingChips] = useState(2);
  const [levels, setLevels] = useState([EMPTY_LEVEL()]);
  const [output, setOutput] = useState('');

  const updateLevel = (li, updater) =>
    setLevels((prev) => prev.map((l, i) => (i === li ? updater(l) : l)));

  const updateQuestion = (li, qi, updater) =>
    updateLevel(li, (l) => ({
      ...l,
      questions: l.questions.map((q, i) => (i === qi ? updater(q) : q)),
    }));

  const updateAnswer = (li, qi, ai, field, value) =>
    updateQuestion(li, qi, (q) => ({
      ...q,
      answers: q.answers.map((a, i) => (i === ai ? { ...a, [field]: value } : a)),
    }));

  const addLevel = () => setLevels((p) => [...p, EMPTY_LEVEL()]);
  const removeLevel = (li) => setLevels((p) => p.filter((_, i) => i !== li));

  const addQuestion = (li) =>
    updateLevel(li, (l) => ({ ...l, questions: [...l.questions, EMPTY_QUESTION()] }));
  const removeQuestion = (li, qi) =>
    updateLevel(li, (l) => ({ ...l, questions: l.questions.filter((_, i) => i !== qi) }));

  const addAnswer = (li, qi) =>
    updateQuestion(li, qi, (q) => ({ ...q, answers: [...q.answers, EMPTY_ANSWER()] }));
  const removeAnswer = (li, qi, ai) =>
    updateQuestion(li, qi, (q) => ({
      ...q, answers: q.answers.filter((_, i) => i !== ai),
    }));

  const generate = () => {
    const result = {
      theme,
      gameDate,
      startingChips: Number(startingChips),
      levels: levels.map((l) => ({
        questions: l.questions.map((q) => {
          const obj = {
            question: q.question,
            questionType: q.questionType,
            stars: Number(q.stars),
            topic: q.topic,
            iconIndex: Number(q.iconIndex),
            answers: q.answers,
          };
          if (q.funFact.trim()) obj.funFact = q.funFact.trim();
          return obj;
        }),
      })),
    };
    setOutput(JSON.stringify(result, null, 2));
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" fontFamily="heading">Quiz Climb Creator</Heading>

      <HStack spacing={4} flexWrap="wrap">
        <FormControl w="200px">
          <FormLabel>Theme</FormLabel>
          <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Ocean Life" />
        </FormControl>
        <FormControl w="180px">
          <FormLabel>Game Date</FormLabel>
          <Input type="date" value={gameDate} onChange={(e) => setGameDate(e.target.value)} />
        </FormControl>
        <FormControl w="160px">
          <FormLabel>Starting Chips</FormLabel>
          <NumberInput min={1} value={startingChips} onChange={(v) => setStartingChips(v)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
      </HStack>

      {levels.map((level, li) => (
        <Box key={li} border="1px solid rgba(212,175,55,0.3)" borderRadius="8px" p={4}>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" fontFamily="heading">Level {li + 1}</Heading>
            {levels.length > 1 && (
              <Button size="xs" variant="outline" onClick={() => removeLevel(li)}>Remove Level</Button>
            )}
          </HStack>

          {level.questions.map((q, qi) => (
            <Box key={qi} bg="rgba(84,56,37,0.5)" borderRadius="6px" p={4} mb={4}>
              <HStack justify="space-between" mb={3}>
                <Badge bg="rgba(212,175,55,0.2)" color="brand.gold">Q{qi + 1}</Badge>
                {level.questions.length > 1 && (
                  <Button size="xs" variant="outline" onClick={() => removeQuestion(li, qi)}>Remove</Button>
                )}
              </HStack>

              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm">Question</FormLabel>
                  <Input value={q.question}
                    onChange={(e) => updateQuestion(li, qi, (x) => ({ ...x, question: e.target.value }))}
                    placeholder="Enter question text" />
                </FormControl>

                <HStack spacing={3} flexWrap="wrap">
                  <FormControl w="180px">
                    <FormLabel fontSize="sm">Type</FormLabel>
                    <Select value={q.questionType}
                      onChange={(e) => updateQuestion(li, qi, (x) => ({ ...x, questionType: e.target.value }))}>
                      <option value="multipleChoice">Multiple Choice</option>
                      <option value="trueFalse">True/False</option>
                    </Select>
                  </FormControl>
                  <FormControl w="100px">
                    <FormLabel fontSize="sm">Stars</FormLabel>
                    <NumberInput min={1} max={5} value={q.stars}
                      onChange={(v) => updateQuestion(li, qi, (x) => ({ ...x, stars: v }))}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl w="160px">
                    <FormLabel fontSize="sm">Topic</FormLabel>
                    <Input value={q.topic}
                      onChange={(e) => updateQuestion(li, qi, (x) => ({ ...x, topic: e.target.value }))}
                      placeholder="Topic" />
                  </FormControl>
                  <FormControl w="120px">
                    <FormLabel fontSize="sm">Icon Index</FormLabel>
                    <NumberInput min={0} value={q.iconIndex}
                      onChange={(v) => updateQuestion(li, qi, (x) => ({ ...x, iconIndex: v }))}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel fontSize="sm">Fun Fact (optional)</FormLabel>
                  <Input value={q.funFact}
                    onChange={(e) => updateQuestion(li, qi, (x) => ({ ...x, funFact: e.target.value }))}
                    placeholder="Fun fact shown after answer" />
                </FormControl>

                <Box>
                  <FormLabel fontSize="sm">Answers</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {q.answers.map((a, ai) => (
                      <HStack key={ai}>
                        <Input flex={1} value={a.answer}
                          onChange={(e) => updateAnswer(li, qi, ai, 'answer', e.target.value)}
                          placeholder={`Answer ${ai + 1}`} size="sm" />
                        <Checkbox
                          isChecked={a.correct}
                          onChange={(e) => updateAnswer(li, qi, ai, 'correct', e.target.checked)}>
                          <Text fontSize="xs">Correct</Text>
                        </Checkbox>
                        {q.answers.length > 2 && (
                          <Button size="xs" variant="outline"
                            onClick={() => removeAnswer(li, qi, ai)}>−</Button>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                  <Button size="xs" mt={2} variant="outline"
                    onClick={() => addAnswer(li, qi)}>+ Answer</Button>
                </Box>
              </VStack>
            </Box>
          ))}

          <Button size="sm" variant="outline" onClick={() => addQuestion(li)}>+ Question</Button>
        </Box>
      ))}

      <Button variant="outline" onClick={addLevel}>+ Level</Button>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
