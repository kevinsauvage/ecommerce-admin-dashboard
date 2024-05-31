interface Option {
  stock: number;
  name: string;
  value: string;
  optionId: string;
}

export function createVariantOptions(options: Option[]): Option[][] {
  const groupedOptions: { [key: string]: Option[] } = options.reduce(
    (acc, option) => {
      if (!acc[option.name]) {
        acc[option.name] = [];
      }
      acc[option.name].push(option);
      return acc;
    },
    {} as { [key: string]: Option[] }
  );

  const groupKeys = Object.keys(groupedOptions);

  function generateCombinations(
    groups: string[],
    current: Option[] = [],
    index: number = 0
  ): Option[][] {
    if (index === groups.length) {
      return [current];
    }

    const combinations: Option[][] = [];
    for (const option of groupedOptions[groups[index]]) {
      combinations.push(
        ...generateCombinations(groups, [...current, option], index + 1)
      );
    }

    return combinations;
  }

  return generateCombinations(groupKeys);
}
