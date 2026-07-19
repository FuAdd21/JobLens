export const ethiojobsAdapter = {
  apiUrl: "http://api.ethiojobs.net/ethiojobs/api/jobs",
  parse: (responseData) => {
    const jobs = [];

    if (!responseData?.data) return jobs;

    for (const job of responseData.data) {
      const title = job.title;
      const description = job.description || "";
      const location = job.state || "";
      const company = job.company?.name || "";
      const slug = job.slug;

      if (title) {
        jobs.push({
          rawContent: `${title}\n${company}\n${location}\n${description}`
            .replace(/<[^>]*>/g, "")
            .trim(),
          sourceUrl: slug
            ? `https://ethiojobs.net/jobs/${slug}`
            : "https://ethiojobs.net/jobs",
          location,
          postedAt: job.date_published
            ? new Date(job.date_published)
            : new Date(),
        });
      }
    }

    return jobs;
  },
};
