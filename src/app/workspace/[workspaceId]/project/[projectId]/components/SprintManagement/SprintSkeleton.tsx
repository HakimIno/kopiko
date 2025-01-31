const SprintSkeleton = () => {
    return (
        <div className="p-6 space-y-4">
            {/* Sprint Controls Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-32 bg-neutral-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-9 w-32 bg-neutral-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>

            {/* Sprints List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                    <div key={index} className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm p-4">
                        {/* Sprint Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
                                <div>
                                    <div className="h-5 w-48 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse mb-2" />
                                    <div className="h-4 w-32 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="h-9 w-28 bg-neutral-200 dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
                        </div>

                        {/* Tasks Skeleton */}
                        <div className="border-t pt-4 space-y-3">
                            {[1, 2, 3].map((taskIndex) => (
                                <div key={taskIndex} className="p-3 bg-gray-50 dark:bg-black/20 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
                                    </div>
                                    <div className="h-4 w-1/2 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse mt-2" />
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="h-6 w-20 bg-neutral-200 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
                                        <div className="h-6 w-24 bg-neutral-200 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SprintSkeleton; 