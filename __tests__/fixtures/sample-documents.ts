/**
 * Sample test documents for testing the reader engine
 */

/**
 * Simple document with basic text
 */
export const SIMPLE_DOCUMENT = `# Simple Document

This is a simple paragraph with some text.

Another paragraph here.`;

/**
 * Document with hierarchy
 */
export const HIERARCHICAL_DOCUMENT = `# Chapter 1

Introduction to the chapter.

## Section 1.1

First section content.

### Subsection 1.1.1

Detailed content here.

## Section 1.2

Second section content.

# Chapter 2

New chapter begins.

## Section 2.1

Content in chapter 2.`;

/**
 * Document with images
 */
export const DOCUMENT_WITH_IMAGES = `# Document with Images

Here is some text before an image.

![Alt text](https://example.com/image1.jpg)

Text between images.

![Second image](https://example.com/image2.jpg)

Text after images.`;

/**
 * Document with only images
 */
export const IMAGES_ONLY_DOCUMENT = `![Image 1](https://example.com/img1.jpg)

![Image 2](https://example.com/img2.jpg)

![Image 3](https://example.com/img3.jpg)`;

/**
 * Empty document
 */
export const EMPTY_DOCUMENT = ``;

/**
 * Document with only whitespace
 */
export const WHITESPACE_DOCUMENT = `


   

`;

/**
 * Document without headings
 */
export const NO_HEADINGS_DOCUMENT = `This is a paragraph without any headings.

Another paragraph here.

And one more for good measure.`;

/**
 * Complex document with mixed content
 */
export const COMPLEX_DOCUMENT = `# Neural Plasticity

Neural plasticity, also known as neuroplasticity or brain plasticity, refers to the brain's ability to modify its connections or re-wire itself.

## What is Plasticity?

Plasticity is the capacity to be shaped, molded, or altered. Neural plasticity refers to the capacity of the nervous system to modify itself, functionally and structurally, in response to experience and injury.

### Types of Plasticity

There are several types of neural plasticity:

#### Functional Plasticity

The brain's ability to move functions from a damaged area to undamaged areas.

#### Structural Plasticity

The brain's ability to actually change its physical structure as a result of learning.

## Long-Term Potentiation

![Synapse diagram](https://example.com/synapse.jpg)

Long-term potentiation (LTP) is a persistent strengthening of synapses based on recent patterns of activity.

### Mechanisms

LTP involves the strengthening of synaptic connections through repeated stimulation.

## Clinical Applications

Understanding neural plasticity has important implications for:

- Recovery from brain injury
- Treatment of neurological disorders
- Enhancement of learning and memory

![Brain scan](https://example.com/brain-scan.jpg)

Research continues to reveal new aspects of brain plasticity.`;

/**
 * Document with lists
 */
export const DOCUMENT_WITH_LISTS = `# Todo List

Here are some tasks:

- Task one
- Task two
- Task three

## Numbered List

1. First item
2. Second item
3. Third item

Done!`;

/**
 * Very long document for performance testing
 */
export const LONG_DOCUMENT = `# Long Document

${"This is a paragraph. ".repeat(100)}

## Section 1

${"Content for section one. ".repeat(200)}

## Section 2

${"Content for section two. ".repeat(200)}

## Section 3

${"Content for section three. ".repeat(200)}
`;

/**
 * Document with special characters
 */
export const SPECIAL_CHARS_DOCUMENT = `# Special Characters

Here are some special characters: **bold text**, *italic text*, and \`code\`.

Links are also [special](https://example.com).

> This is a blockquote with some text.

End of document.`;

/**
 * Single word document
 */
export const SINGLE_WORD_DOCUMENT = `Hello`;

/**
 * Single heading document
 */
export const SINGLE_HEADING_DOCUMENT = `# Title`;

/**
 * Document for testing paragraph snapping
 */
export const PARAGRAPH_SNAP_DOCUMENT = `# Document

First paragraph with multiple words in it.

Second paragraph also with multiple words.

Third paragraph here.

Fourth paragraph at the end.`;
