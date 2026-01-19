import { CampaignState } from '../types';

export const exportToCSV = (campaign: CampaignState) => {
  // Enhanced CSV generation to include all assets
  // Using a structure that puts new fields in additional columns for review
  const headers = [
      'Campaign', 'Ad Group', 'Keyword', 'Type',
      // Headlines 1-15
      ...Array.from({length: 15}, (_, i) => `Headline ${i + 1}`),
      // Descriptions 1-4
      ...Array.from({length: 4}, (_, i) => `Description ${i + 1}`),
      'Sitelinks', 'Callouts', 'Structured Snippets'
  ];
  
  const rows: string[] = [];
  const campaignName = `Search - ${campaign.extractedInfo?.title || 'Generated'} - ${new Date().toISOString().split('T')[0]}`;

  // Add Keywords Rows
  campaign.adGroups.forEach(group => {
      // 1. Keyword Rows
      (group.keywords || []).forEach(keyword => {
          const rowData = [
              campaignName,
              group.name,
              keyword,
              'Keyword',
              // Empty ad fields
              ...Array(15 + 4 + 3).fill('') 
          ];
          rows.push(rowData.map(cell => `"${cell}"`).join(','));
      });

      // 2. Ad Content Row
      const safeHeadlines = group.headlines || [];
      const safeDescriptions = group.descriptions || [];
      
      const headlines = Array.from({length: 15}, (_, i) => safeHeadlines[i] || '');
      const descriptions = Array.from({length: 4}, (_, i) => safeDescriptions[i] || '');

      const rowData = [
          campaignName,
          group.name,
          '',
          'Responsive Search Ad',
          ...headlines,
          ...descriptions,
          (group.sitelinks || []).join('; '),
          (group.callouts || []).join('; '),
          (group.structuredSnippets || []).join('; ')
      ];
      rows.push(rowData.map(cell => `"${cell}"`).join(','));
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'campaign_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};