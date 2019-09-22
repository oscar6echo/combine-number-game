import { SequenceGenerator } from './sequenceGenerator';
import { SequenceEvaluator } from './sequenceEvaluator';

onmessage = function(msg) {
  const { workerId, payload } = msg.data;
  console.log('START worker ' + workerId);
  const { pattern, numbers, target, targetRange } = payload;
  const seqGenerator = new SequenceGenerator({ numbers });
  const seqEvaluator = new SequenceEvaluator({ target });

  const defaultTargetRange = 5;
  const g = seqGenerator.run(pattern);
  let output;

  for (let seq of g) {
    const { valid, result, sequence } = seqEvaluator.run(seq);
    if (valid) {
      if (Math.abs(result - target) <= (targetRange || defaultTargetRange)) {
        output = {
          value: result,
          sequence
        };
        postMessage({ workerId, payload: output });
      }
    }
  }
  output = { done: true };
  postMessage({ workerId, payload: output });
  close();
};
