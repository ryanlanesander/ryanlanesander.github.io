import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Textarea, Input, Button, Divider, HStack,
  NumberInput, NumberInputField,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

const EMPTY_ITEM = () => ({ name: '', value: '' });

export default function StackedCreator() {
  const [prompt, setPrompt] = useState('');
  const [lowText, setLowText] = useState('');
  const [highText, setHighText] = useState('');
  const [items, setItems] = useState(Array.from({ length: 5 }, EMPTY_ITEM));
  const [output, setOutput] = useState('');

  const updateItem = (i, field, val) =>
    setItems((p) => p.map((x, j) => j === i ? { ...x, [field]: val } : x));

  const generate = () => {
    const stackItems = items
      .map((item, i) => ({ name: item.name.trim(), value: item.value.trim(), hintIndex: i }))
      .filter((item) => item.name && item.value);
    setOutput(JSON.stringify({
      lowText: lowText || 'Earliest to Premiere',
      highText: highText || 'Latest to Premiere',
      stackItems,
      stackPrompt: prompt,
    }, null, 2));
  };

  return (
    <VStack spacing={5} align="stretch">
      <Heading size="lg" fontFamily="heading">Stacked Creator</Heading>

      <FormControl>
        <FormLabel>Prompt</FormLabel>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="Put the Hayao Miyazaki Films in order by release date from EARLIEST to LATEST" />
      </FormControl>

      <HStack spacing={4}>
        <FormControl>
          <FormLabel>Low Text (left label)</FormLabel>
          <Input value={lowText} onChange={(e) => setLowText(e.target.value)}
            placeholder="Earliest to Premiere" />
        </FormControl>
        <FormControl>
          <FormLabel>High Text (right label)</FormLabel>
          <Input value={highText} onChange={(e) => setHighText(e.target.value)}
            placeholder="Latest to Premiere" />
        </FormControl>
      </HStack>

      <FormLabel mb={0}>Options</FormLabel>
      <VStack spacing={2} align="stretch">
        {items.map((item, i) => (
          <HStack key={i}>
            <Input flex={2} value={item.name} placeholder={`Option ${i + 1} name`} size="sm"
              onChange={(e) => updateItem(i, 'name', e.target.value)} />
            <Input flex={1} value={item.value} placeholder="Value (e.g. 1984)" size="sm"
              onChange={(e) => updateItem(i, 'value', e.target.value)} />
            {items.length > 2 && (
              <Button size="xs" variant="outline"
                onClick={() => setItems((p) => p.filter((_, j) => j !== i))}>−</Button>
            )}
          </HStack>
        ))}
      </VStack>
      <Button size="sm" variant="outline" onClick={() => setItems((p) => [...p, EMPTY_ITEM()])}>
        + Option
      </Button>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
