const generateFilenames = (numFiles: number, baseUrl: string) => {
    const filenames = [];
    for (let i = 1; i <= numFiles; i++) {
      filenames.push(`${baseUrl}${i}.png`);
    }
    return filenames;
  };
  
  const generateImageSets = (filenames: string[], imagesPerSet: number) => {
    const sets = [];
    for (let i = 0; i < filenames.length; i += imagesPerSet) {
      const set = filenames.slice(i, i + imagesPerSet).map((filename, index) => ({
        id: i + index + 1,
        image_url: filename,
        seed: `seed${i + index + 1}`,
      }));
      sets.push(set);
    }
    return sets;
  };
  
export const filenames = generateFilenames(678, "./"); // Adjust the number to match your total files
export const staticImagesSet = generateImageSets(filenames, 4);
  