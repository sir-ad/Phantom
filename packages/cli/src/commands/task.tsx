
import React, { useState, useEffect } from 'react';
import { Text, Box, useApp } from 'ink';
import { TaskMasterAgent, type TaskNode } from '@phantom-pm/core';
import Spinner from 'ink-spinner';

const BoxAny = Box as any;

export const TaskAnalyze = ({ goal }: { goal: string }) => {
    const { exit } = useApp();
    const [tasks, setTasks] = useState<TaskNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const analyze = async () => {
            try {
                const agent = new TaskMasterAgent();
                const result = await agent.decompose(goal);
                setTasks(result);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        };

        analyze();
    }, [goal]);

    if (loading) {
        return (
            <BoxAny>
                <Text color="green">
                    <Spinner type="dots" />
                </Text>
                <Text> Analyzing task complexity and decomposing: "{goal}"...</Text>
            </BoxAny>
        );
    }

    if (error) {
        return <Text color="red">Error: {error}</Text>;
    }

    return (
        <BoxAny flexDirection="column" padding={1}>
            <Text bold color="cyan">Task Analysis: {goal}</Text>
            <BoxAny flexDirection="column" marginTop={1}>
                {tasks.map((task) => (
                    <TaskItem key={task.id} node={task} depth={0} />
                ))}
            </BoxAny>
            <Text color="gray">Analysis complete. {tasks.length} high-level tasks identified.</Text>
        </BoxAny>
    );
};

const TaskItem = ({ node, depth }: { node: TaskNode; depth: number }) => {
    const indent = '  '.repeat(depth);
    const color = node.complexity > 7 ? 'red' : node.complexity > 4 ? 'yellow' : 'green';

    return (
        <BoxAny flexDirection="column">
            <BoxAny>
                <Text>{indent}</Text>
                <Text color={color} bold>{node.title}</Text>
                <Text> (Complexity: {node.complexity})</Text>
            </BoxAny>
            <BoxAny marginLeft={2}>
                <Text color="gray">{indent}↳ {node.description}</Text>
            </BoxAny>
            {node.subtasks && node.subtasks.length > 0 && (
                <BoxAny flexDirection="column">
                    {node.subtasks.map(sub => (
                        <TaskItem key={sub.id} node={sub} depth={depth + 1} />
                    ))}
                </BoxAny>
            )}
        </BoxAny>
    );
};
