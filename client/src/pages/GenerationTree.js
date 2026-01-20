import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Chip } from '@mui/material';

const NodeCard = ({ node, onClick }) => (
  <Paper elevation={3} sx={{ p: 2, minWidth: 180, textAlign: 'center', border: node.active ? '2px solid #4caf50' : '2px solid #f44336' }} onClick={() => onClick?.(node)}>
    <Avatar sx={{ mx: 'auto', mb: 1 }}>{node.name[0]}</Avatar>
    <Typography variant="subtitle2" fontWeight="bold">{node.name}</Typography>
    <Typography variant="caption" color="text.secondary">ID: {node.id}</Typography>
    <Box mt={1}>
      <Chip size="small" label={node.rank} color="primary" sx={{ mr: 1 }} />
      <Chip size="small" label={node.active ? 'Active' : 'Inactive'} color={node.active ? 'success' : 'default'} />
    </Box>
  </Paper>
);

const Connector = ({ vertical = 20, horizontal = 220 }) => (
  <Box sx={{ mt: 2 }}>
    <Box sx={{ width: 2, height: vertical, backgroundColor: '#ccc', mx: 'auto' }} />
    <Box sx={{ height: 2, backgroundColor: '#ccc', width: `${horizontal}px`, mx: 'auto', position: 'relative' }} />
  </Box>
);

const GenerationTree = () => {
  const [searchId, setSearchId] = useState('');
  const sampleTree = useMemo(() => ({
    id: 'U1001', name: 'You', rank: 'Gold', active: true,
    children: [
      { id: 'U2001', name: 'Alice', rank: 'Silver', active: true, children: [
        { id: 'U3001', name: 'Mike', rank: 'Bronze', active: true, children: [] },
        { id: 'U3002', name: 'Nina', rank: 'Bronze', active: false, children: [] },
      ] },
      { id: 'U2002', name: 'Bob', rank: 'Silver', active: true, children: [
        { id: 'U3003', name: 'Oscar', rank: 'Bronze', active: true, children: [] },
      ] },
    ]
  }), []);

  const onSearch = () => {
    // In a real app, implement search & focus logic
  };

  const TreeNode = ({ node }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
      <NodeCard node={node} />
      {node.children?.length > 0 && (
        <>
          <Connector horizontal={(node.children.length - 1) * 220} />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {node.children.map((c) => (
              <TreeNode key={c.id} node={c} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Referral Tree</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Member ID Search" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={onSearch}>Search</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, overflow: 'auto', minHeight: 400 }}>
        <TreeNode node={sampleTree} />
      </Paper>
    </Box>
  );
};

export default GenerationTree;