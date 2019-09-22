import { SequenceGenerator } from './sequenceGenerator';
import { SequenceEvaluator } from './sequenceEvaluator';

onmessage = function(msg) {
  const { msgId, workerId, payload } = msg.data;
  const { pattern, numbers, target, targetRange } = payload;
  const seqGenerator = new SequenceGenerator({ numbers });
  const seqEvaluator = new SequenceEvaluator({ target });

  const defaultTargetRange = 5;
  const g = seqGenerator.run(pattern);

  for (let seq of g) {
    const { valid, result, sequence } = seqEvaluator.run(seq);
    if (valid) {
      if (Math.abs(result - target) <= targetRange || defaultTargetRange) {
        const payload = {
          //   isSol: result === this.target,
          value: result,
          sequence: JSON.stringify(sequence)
        };
        postMessage(msgId, workerId, payload);
      }
    }
  }
};
