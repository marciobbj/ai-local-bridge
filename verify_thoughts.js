const THOUGHT_PATTERNS = [
    { start: '<think>', end: '</think>', regex: /<think>([\s\S]*?)<\/think>/, openRegex: /<think>([\s\S]*)$/ },
    { start: '<thought>', end: '</thought>', regex: /<thought>([\s\S]*?)<\/thought>/, openRegex: /<thought>([\s\S]*)$/ },
    { start: '[THOUGHT]', end: '[/THOUGHT]', regex: /\[THOUGHT\]([\s\S]*?)\[\/THOUGHT\]/, openRegex: /\[THOUGHT\]([\s\S]*)$/ }
];

function parseMessage(content) {
    if (!content) return { content: '', thought: '', hasThought: false };

    for (const pattern of THOUGHT_PATTERNS) {
        // Check for complete thought
        const match = content.match(pattern.regex);
        if (match) {
            return {
                content: content.replace(pattern.regex, '').trim(),
                thought: match[1].trim(),
                hasThought: true,
                format: pattern.start
            };
        }

        // Check for unclosed thought (streaming)
        const openMatch = content.match(pattern.openRegex);
        if (openMatch) {
            return {
                content: content.replace(pattern.openRegex, '').trim(),
                thought: openMatch[1].trim(),
                hasThought: true,
                format: pattern.start + ' (streaming)'
            };
        }
    }

    return { content: content, thought: '', hasThought: false };
}

const testCases = [
    { input: "<think>This is a thought</think>This is the response", expected: { hasThought: true, thought: "This is a thought", content: "This is the response" } },
    { input: "<thought>Another format</thought>Response here", expected: { hasThought: true, thought: "Another format", content: "Response here" } },
    { input: "[THOUGHT]Square brackets[/THOUGHT]Response", expected: { hasThought: true, thought: "Square brackets", content: "Response" } },
    { input: "<think>Streaming thought...", expected: { hasThought: true, thought: "Streaming thought...", content: "" } },
    { input: "No thought here", expected: { hasThought: false } }
];

console.log("Running tests...");
testCases.forEach((test, index) => {
    const result = parseMessage(test.input);
    const passed = result.hasThought === test.expected.hasThought &&
        (!test.expected.hasThought || (result.thought === test.expected.thought && result.content === test.expected.content));
    console.log(`Test ${index + 1}: ${passed ? "PASSED" : "FAILED"}`);
    if (!passed) {
        console.log("Expected:", test.expected);
        console.log("Actual:", result);
    }
});
