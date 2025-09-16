import React from 'react';
import { Card, Text } from 'react-native-paper';

const SafeCardContent = ({ children, source = 'Unknown', ...props }) => {
  // Get component display name for better path tracking
  const getDisplayName = (element) => {
    if (!React.isValidElement(element)) return 'unknown';
    return element.type?.displayName || element.type?.name || element.type || 'element';
  };

  // Recursive function to process and auto-wrap raw text nodes
  const processNode = (node, path = 'root') => {
    // Handle strings and numbers - wrap them and log
    if (typeof node === 'string' || typeof node === 'number') {
      // Only wrap if it's not empty or whitespace
      const nodeStr = String(node).trim();
      if (nodeStr === '') {
        return null; // Skip empty strings
      }
      console.warn(`🚨 [SafeCardContent] RAW TEXT at ${source}/${path}:`, JSON.stringify(node));
      return <Text key={path}>{node}</Text>;
    }

    // Handle arrays
    if (Array.isArray(node)) {
      return node.map((child, index) => processNode(child, `${path}[${index}]`)).filter(Boolean);
    }

    // Handle React elements
    if (React.isValidElement(node)) {
      const displayName = getDisplayName(node);
      const processedChildren = processNode(node.props.children, `${path}/${displayName}`);
      return React.cloneElement(node, { key: node.key || path }, processedChildren);
    }

    // Handle null, undefined, boolean - these are fine
    return node;
  };

  // Process all children recursively
  const processedChildren = processNode(React.Children.toArray(children), 'children');

  return (
    <Card.Content {...props}>
      {processedChildren}
    </Card.Content>
  );
};

export default SafeCardContent;