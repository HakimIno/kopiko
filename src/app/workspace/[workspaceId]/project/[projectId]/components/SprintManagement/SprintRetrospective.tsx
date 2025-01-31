import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface SprintRetrospectiveProps {
    sprintId: string;
    initialData?: {
        whatWentWell: string[];
        whatWentWrong: string[];
        actionItems: string[];
    };
    onSave: (data: {
        whatWentWell: string[];
        whatWentWrong: string[];
        actionItems: string[];
    }) => void;
    isEditable?: boolean;
}

export const SprintRetrospective: React.FC<SprintRetrospectiveProps> = ({
    sprintId,
    initialData,
    onSave,
    isEditable = true,
}) => {
    const [whatWentWell, setWhatWentWell] = useState<string[]>(initialData?.whatWentWell || []);
    const [whatWentWrong, setWhatWentWrong] = useState<string[]>(initialData?.whatWentWrong || []);
    const [actionItems, setActionItems] = useState<string[]>(initialData?.actionItems || []);
    const [newItem, setNewItem] = useState<{ [key: string]: string }>({
        whatWentWell: '',
        whatWentWrong: '',
        actionItems: '',
    });

    const handleAddItem = (category: 'whatWentWell' | 'whatWentWrong' | 'actionItems') => {
        if (!newItem[category].trim()) return;

        switch (category) {
            case 'whatWentWell':
                setWhatWentWell([...whatWentWell, newItem[category]]);
                break;
            case 'whatWentWrong':
                setWhatWentWrong([...whatWentWrong, newItem[category]]);
                break;
            case 'actionItems':
                setActionItems([...actionItems, newItem[category]]);
                break;
        }
        setNewItem({ ...newItem, [category]: '' });
    };

    const handleRemoveItem = (category: 'whatWentWell' | 'whatWentWrong' | 'actionItems', index: number) => {
        switch (category) {
            case 'whatWentWell':
                setWhatWentWell(whatWentWell.filter((_, i) => i !== index));
                break;
            case 'whatWentWrong':
                setWhatWentWrong(whatWentWrong.filter((_, i) => i !== index));
                break;
            case 'actionItems':
                setActionItems(actionItems.filter((_, i) => i !== index));
                break;
        }
    };

    const handleSave = () => {
        onSave({
            whatWentWell,
            whatWentWrong,
            actionItems,
        });
    };

    const renderSection = (
        title: string,
        items: string[],
        category: 'whatWentWell' | 'whatWentWrong' | 'actionItems',
        bgColor: string
    ) => (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg flex justify-between items-start ${bgColor}`}
                    >
                        <p className="text-sm">{item}</p>
                        {isEditable && (
                            <button
                                onClick={() => handleRemoveItem(category, index)}
                                className="text-gray-500 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {isEditable && (
                    <div className="flex gap-2">
                        <Textarea
                            value={newItem[category]}
                            onChange={(e) => setNewItem({ ...newItem, [category]: e.target.value })}
                            placeholder={`Add new ${title.toLowerCase()} item...`}
                            className="text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={() => handleAddItem(category)}
                            className="mt-2"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Sprint Retrospective</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderSection(
                    'What Went Well',
                    whatWentWell,
                    'whatWentWell',
                    'bg-green-50 dark:bg-green-900/20'
                )}
                {renderSection(
                    'What Needs Improvement',
                    whatWentWrong,
                    'whatWentWrong',
                    'bg-red-50 dark:bg-red-900/20'
                )}
                {renderSection(
                    'Action Items',
                    actionItems,
                    'actionItems',
                    'bg-blue-50 dark:bg-blue-900/20'
                )}

                {isEditable && (
                    <div className="flex justify-end">
                        <Button onClick={handleSave}>Save Retrospective</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 