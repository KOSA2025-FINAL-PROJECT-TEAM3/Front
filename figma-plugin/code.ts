// Figma Plugin: JSON to Auto Layout Importer
// Supports full Auto Layout structure with nested frames

figma.showUI(__html__, { width: 500, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-json') {
    try {
      const jsonData = msg.data;

      // Create the frame from JSON
      const frame = await createNodeFromJSON(jsonData);

      if (frame) {
        // Center the frame in viewport
        figma.viewport.scrollAndZoomIntoView([frame]);
        figma.currentPage.selection = [frame];

        figma.notify('✅ Successfully imported wireframe!');
      } else {
        figma.notify('❌ Failed to create frame', { error: true });
      }

    } catch (error) {
      console.error('Import error:', error);
      figma.notify(`❌ Error: ${error.message}`, { error: true });
    }
  } else if (msg.type === 'import-multiple-json') {
    try {
      const jsonData = msg.data;
      const screens = jsonData.screens || jsonData;

      if (!Array.isArray(screens) || screens.length === 0) {
        figma.notify('❌ No screens found in JSON', { error: true });
        return;
      }

      const frames: FrameNode[] = [];
      const frameMap = new Map<string, FrameNode>(); // Map screen names to frames
      let xOffset = 0;
      const spacing = 100; // Space between screens

      // Import each screen
      for (let i = 0; i < screens.length; i++) {
        const screenData = screens[i];
        const screenName = screenData?.name || `Screen ${i + 1}`;

        try {
          const frame = await createNodeFromJSON(screenData);

          if (frame) {
            // Position frames horizontally with spacing
            frame.x = xOffset;
            frame.y = 0;
            xOffset += frame.width + spacing;
            frames.push(frame);
            frameMap.set(screenName, frame);
          }
        } catch (error) {
          console.error(`Error importing screen "${screenName}":`, error);
          figma.notify(`❌ Error importing "${screenName}": ${error.message}`, { error: true });
          throw error; // Re-throw to stop the import process
        }
      }

      // Apply prototype flows if available
      if (jsonData.flows && Array.isArray(jsonData.flows)) {
        const flowsApplied = applyPrototypeFlows(jsonData.flows, frameMap);
        console.log(`Applied ${flowsApplied} prototype flows`);
      }

      if (frames.length > 0) {
        // Center all frames in viewport
        figma.viewport.scrollAndZoomIntoView(frames);
        figma.currentPage.selection = frames;

        const flowInfo = jsonData.flows ? ` with ${jsonData.flows.length} flows` : '';
        figma.notify(`✅ Successfully imported ${frames.length} screen(s)${flowInfo}!`);
      } else {
        figma.notify('❌ Failed to create any frames', { error: true });
      }

    } catch (error) {
      console.error('Multiple import error:', error);
      figma.notify(`❌ Error: ${error.message}`, { error: true });
    }
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// Main function to create Figma nodes from JSON
async function createNodeFromJSON(json: any): Promise<FrameNode | null> {
  if (!json) {
    throw new Error('Invalid JSON: JSON data is null or undefined');
  }

  if (!json.type) {
    const availableKeys = Object.keys(json).join(', ');
    throw new Error(`Invalid JSON: Missing "type" field. Available fields: ${availableKeys}`);
  }

  const node = await createNode(json);
  return node as FrameNode;
}

// Recursive function to create nodes
async function createNode(data: any): Promise<SceneNode | null> {
  const type = data.type;

  switch (type) {
    case 'FRAME':
      return await createFrame(data);
    case 'COMPONENT':
      return await createComponent(data);
    case 'TEXT':
      return await createText(data);
    case 'RECTANGLE':
      return await createRectangle(data);
    case 'ELLIPSE':
      return await createEllipse(data);
    default:
      console.warn(`Unsupported type: ${type}`);
      return null;
  }
}

// Create Frame with Auto Layout
async function createFrame(data: any): Promise<FrameNode> {
  const frame = figma.createFrame();

  // Basic properties
  frame.name = data.name || 'Frame';

  if (data.width) frame.resize(data.width, data.height || 100);
  if (data.x !== undefined) frame.x = data.x;
  if (data.y !== undefined) frame.y = data.y;

  // Auto Layout
  if (data.layoutMode && data.layoutMode !== 'NONE') {
    frame.layoutMode = data.layoutMode;

    // Sizing mode with defaults
    frame.primaryAxisSizingMode = data.primaryAxisSizingMode || 'AUTO';
    frame.counterAxisSizingMode = data.counterAxisSizingMode || 'AUTO';

    // Alignment
    if (data.primaryAxisAlignItems) {
      frame.primaryAxisAlignItems = data.primaryAxisAlignItems;
    }
    if (data.counterAxisAlignItems) {
      frame.counterAxisAlignItems = data.counterAxisAlignItems;
    }

    // Spacing
    if (data.itemSpacing !== undefined) {
      frame.itemSpacing = data.itemSpacing;
    }

    // Padding
    if (data.paddingTop !== undefined) frame.paddingTop = data.paddingTop;
    if (data.paddingRight !== undefined) frame.paddingRight = data.paddingRight;
    if (data.paddingBottom !== undefined) frame.paddingBottom = data.paddingBottom;
    if (data.paddingLeft !== undefined) frame.paddingLeft = data.paddingLeft;
  }

  // Corner radius
  if (data.cornerRadius !== undefined) {
    frame.cornerRadius = data.cornerRadius;
  }

  // Fills (background)
  if (data.fills && data.fills.length > 0) {
    frame.fills = convertFills(data.fills);
  } else if (data.fills && data.fills.length === 0) {
    frame.fills = [];
  }

  // Strokes (borders)
  if (data.strokes && data.strokes.length > 0) {
    frame.strokes = convertStrokes(data.strokes);
    if (data.strokeWeight) frame.strokeWeight = data.strokeWeight;
  }

  // Children
  if (data.children && data.children.length > 0) {
    for (const childData of data.children) {
      const child = await createNode(childData);
      if (child) {
        frame.appendChild(child);
      }
    }
  }

  return frame;
}

// Create Component (similar to Frame)
async function createComponent(data: any): Promise<ComponentNode> {
  const component = figma.createComponent();

  // Basic properties
  component.name = data.name || 'Component';

  if (data.width) component.resize(data.width, data.height || 100);
  if (data.x !== undefined) component.x = data.x;
  if (data.y !== undefined) component.y = data.y;

  // Auto Layout
  if (data.layoutMode && data.layoutMode !== 'NONE') {
    component.layoutMode = data.layoutMode;

    // Sizing mode with defaults
    component.primaryAxisSizingMode = data.primaryAxisSizingMode || 'AUTO';
    component.counterAxisSizingMode = data.counterAxisSizingMode || 'AUTO';

    if (data.primaryAxisAlignItems) {
      component.primaryAxisAlignItems = data.primaryAxisAlignItems;
    }
    if (data.counterAxisAlignItems) {
      component.counterAxisAlignItems = data.counterAxisAlignItems;
    }

    if (data.itemSpacing !== undefined) {
      component.itemSpacing = data.itemSpacing;
    }

    if (data.paddingTop !== undefined) component.paddingTop = data.paddingTop;
    if (data.paddingRight !== undefined) component.paddingRight = data.paddingRight;
    if (data.paddingBottom !== undefined) component.paddingBottom = data.paddingBottom;
    if (data.paddingLeft !== undefined) component.paddingLeft = data.paddingLeft;
  }

  if (data.cornerRadius !== undefined) {
    component.cornerRadius = data.cornerRadius;
  }

  if (data.fills && data.fills.length > 0) {
    component.fills = convertFills(data.fills);
  } else if (data.fills && data.fills.length === 0) {
    component.fills = [];
  }

  if (data.strokes && data.strokes.length > 0) {
    component.strokes = convertStrokes(data.strokes);
    if (data.strokeWeight) component.strokeWeight = data.strokeWeight;
  }

  // Children
  if (data.children && data.children.length > 0) {
    for (const childData of data.children) {
      const child = await createNode(childData);
      if (child) {
        component.appendChild(child);
      }
    }
  }

  return component;
}

// Create Text
async function createText(data: any): Promise<TextNode> {
  const text = figma.createText();

  text.name = data.name || 'Text';

  // Load font before setting characters
  if (data.fontName) {
    try {
      await figma.loadFontAsync(data.fontName);
      text.fontName = data.fontName;
    } catch (error) {
      console.warn(`Font not available: ${data.fontName.family}. Using default.`);
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    }
  } else {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  }

  // Set text content
  if (data.characters) {
    text.characters = data.characters;
  }

  // Font size
  if (data.fontSize) {
    text.fontSize = data.fontSize;
  }

  // Text color
  if (data.fills && data.fills.length > 0) {
    text.fills = convertFills(data.fills);
  }

  if (data.x !== undefined) text.x = data.x;
  if (data.y !== undefined) text.y = data.y;

  return text;
}

// Create Rectangle
async function createRectangle(data: any): Promise<RectangleNode> {
  const rect = figma.createRectangle();

  rect.name = data.name || 'Rectangle';

  if (data.width && data.height) {
    rect.resize(data.width, data.height);
  }

  if (data.x !== undefined) rect.x = data.x;
  if (data.y !== undefined) rect.y = data.y;

  if (data.cornerRadius !== undefined) {
    rect.cornerRadius = data.cornerRadius;
  }

  if (data.fills && data.fills.length > 0) {
    rect.fills = convertFills(data.fills);
  }

  if (data.strokes && data.strokes.length > 0) {
    rect.strokes = convertStrokes(data.strokes);
    if (data.strokeWeight) rect.strokeWeight = data.strokeWeight;
  }

  return rect;
}

// Create Ellipse
async function createEllipse(data: any): Promise<EllipseNode> {
  const ellipse = figma.createEllipse();

  ellipse.name = data.name || 'Ellipse';

  if (data.width && data.height) {
    ellipse.resize(data.width, data.height);
  }

  if (data.x !== undefined) ellipse.x = data.x;
  if (data.y !== undefined) ellipse.y = data.y;

  if (data.fills && data.fills.length > 0) {
    ellipse.fills = convertFills(data.fills);
  }

  if (data.strokes && data.strokes.length > 0) {
    ellipse.strokes = convertStrokes(data.strokes);
    if (data.strokeWeight) ellipse.strokeWeight = data.strokeWeight;
  }

  return ellipse;
}

// Convert fills from JSON format to Figma format
function convertFills(fills: any[]): Paint[] {
  return fills.map(fill => {
    if (fill.type === 'SOLID') {
      return {
        type: 'SOLID',
        color: {
          r: fill.color.r,
          g: fill.color.g,
          b: fill.color.b
        },
        opacity: fill.opacity !== undefined ? fill.opacity : 1
      } as SolidPaint;
    }
    return fill;
  });
}

// Convert strokes from JSON format to Figma format
function convertStrokes(strokes: any[]): Paint[] {
  return convertFills(strokes); // Same format as fills
}

// Apply prototype flows (화살표 연결)
function applyPrototypeFlows(flows: any[], frameMap: Map<string, FrameNode>): number {
  let appliedCount = 0;
  let skippedCount = 0;

  console.log(`\n🔗 Applying ${flows.length} prototype flows...`);
  console.log(`Available frames: ${Array.from(frameMap.keys()).join(', ')}\n`);

  for (const flow of flows) {
    try {
      const fromScreenName = flow.from;
      const toScreenName = flow.to;
      const fromElementName = flow.fromElement;
      const action = flow.action || 'CLICK';

      console.log(`\n📍 Processing flow: "${fromScreenName}" → "${toScreenName}"`);
      console.log(`   Looking for element: "${fromElementName}"`);

      // Find source and destination frames
      const fromFrame = frameMap.get(fromScreenName);
      const toFrame = frameMap.get(toScreenName);

      if (!fromFrame) {
        console.warn(`   ❌ Source frame "${fromScreenName}" not found`);
        skippedCount++;
        continue;
      }

      if (!toFrame) {
        console.warn(`   ❌ Destination frame "${toScreenName}" not found`);
        skippedCount++;
        continue;
      }

      console.log(`   ✓ Both frames found`);

      // Find the element to attach the interaction to
      const sourceElement = findNodeByName(fromFrame, fromElementName);

      if (!sourceElement) {
        console.warn(`   ❌ Element "${fromElementName}" not found in "${fromScreenName}"`);
        console.warn(`   Available elements:`);
        logAllNodeNames(fromFrame, '      ');
        skippedCount++;
        continue;
      }

      console.log(`   ✓ Element found: ${sourceElement.name} (${sourceElement.type})`);

      // Check if element supports reactions
      if (!('reactions' in sourceElement)) {
        console.warn(`   ❌ Element "${fromElementName}" does not support reactions`);
        skippedCount++;
        continue;
      }

      // Create prototype interaction
      const reaction: Reaction = {
        action: {
          type: 'NODE',
          destinationId: toFrame.id,
          navigation: 'NAVIGATE',
          transition: {
            type: 'DISSOLVE',
            duration: 0.3,
            easing: { type: 'EASE_OUT' }
          }
        },
        trigger: {
          type: action === 'CLICK' ? 'ON_CLICK' : 'ON_CLICK'
        }
      };

      // Apply reaction to the source element
      sourceElement.reactions = [reaction];
      appliedCount++;

      console.log(`   ✅ Flow applied successfully!`);

    } catch (error) {
      console.error(`   ❌ Error applying flow:`, error);
      skippedCount++;
    }
  }

  console.log(`\n📊 Summary: ${appliedCount} flows applied, ${skippedCount} skipped`);
  return appliedCount;
}

// Helper function to log all node names (for debugging)
function logAllNodeNames(node: BaseNode, prefix: string = '', maxDepth: number = 3, currentDepth: number = 0): void {
  if (currentDepth >= maxDepth) return;

  console.log(`${prefix}${node.name} (${node.type})`);

  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      logAllNodeNames(child, prefix + '  ', maxDepth, currentDepth + 1);
    }
  }
}

// Helper function to find a node by name (recursive search)
function findNodeByName(node: BaseNode, targetName: string): SceneNode | null {
  if (node.name === targetName && 'reactions' in node) {
    return node as SceneNode;
  }

  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      const found = findNodeByName(child, targetName);
      if (found) return found;
    }
  }

  return null;
}
