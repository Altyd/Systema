import { supabase } from './supabase';
import { Architecture } from '../types';

export interface SavedArchitecture {
  id: string;
  name: string;
  description: string;
  data: Architecture;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_public: boolean;
  public_link: string | null;
}

export interface Collaborator {
  id: string;
  architecture_id: string;
  user_id: string;
  role: 'Owner' | 'Editor' | 'Commenter' | 'Viewer';
  added_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  };
}

// Ensure user profile exists before operations
async function ensureProfileExists(userId: string, email: string): Promise<void> {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
      });
    
    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Failed to create profile:', error);
      throw error;
    }
  }
}

// Save architecture to Supabase
export async function saveArchitecture(
  architecture: Architecture,
  userId: string,
  userEmail?: string
): Promise<{ data: SavedArchitecture | null; error: Error | null }> {
  try {
    // Ensure profile exists first
    if (userEmail) {
      await ensureProfileExists(userId, userEmail);
    }

    // Check if architecture already exists (update vs insert)
    const { data: existing } = await supabase
      .from('architectures')
      .select('id, version')
      .eq('id', architecture.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

    if (existing) {
      // Update existing architecture
      const { data, error } = await supabase
        .from('architectures')
        .update({
          name: architecture.name,
          description: architecture.description,
          data: architecture,
          updated_at: new Date().toISOString(),
          version: existing.version + 1,
        })
        .eq('id', architecture.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Insert new architecture
      const { data, error } = await supabase
        .from('architectures')
        .insert({
          id: architecture.id,
          name: architecture.name,
          description: architecture.description,
          data: architecture,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Load user's architectures
export async function loadUserArchitectures(
  userId: string
): Promise<{ data: SavedArchitecture[] | null; error: Error | null }> {
  try {
    console.log('Loading architectures for user:', userId);
    
    // Get architectures created by the user
    const { data: ownedArchitectures, error: ownedError } = await supabase
      .from('architectures')
      .select('*')
      .eq('created_by', userId)
      .order('updated_at', { ascending: false });

    if (ownedError) {
      console.error('Error loading owned architectures:', ownedError);
      throw ownedError;
    }
    console.log('Owned architectures:', ownedArchitectures?.length || 0);

    // Get architectures where user is a collaborator
    const { data: collaborations, error: collabError } = await supabase
      .from('architecture_collaborators')
      .select('architecture_id')
      .eq('user_id', userId);

    if (collabError) {
      console.error('Error loading collaborations:', collabError);
      throw collabError;
    }
    console.log('Collaborations found:', collaborations?.length || 0, collaborations);

    // If there are collaborations, fetch those architectures too
    let sharedArchitectures: SavedArchitecture[] = [];
    if (collaborations && collaborations.length > 0) {
      const archIds = collaborations.map(c => c.architecture_id);
      console.log('Fetching shared architectures with IDs:', archIds);
      
      const { data: shared, error: sharedError } = await supabase
        .from('architectures')
        .select('*')
        .in('id', archIds)
        .order('updated_at', { ascending: false });

      if (sharedError) {
        console.error('Error loading shared architectures:', sharedError);
        throw sharedError;
      }
      sharedArchitectures = shared || [];
      console.log('Shared architectures loaded:', sharedArchitectures.length);
    }

    // Combine and deduplicate
    const allArchitectures = [...(ownedArchitectures || [])];
    for (const arch of sharedArchitectures) {
      if (!allArchitectures.find(a => a.id === arch.id)) {
        allArchitectures.push(arch);
      }
    }

    // Sort by updated_at
    allArchitectures.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    console.log('Total architectures returned:', allArchitectures.length);
    return { data: allArchitectures, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Load single architecture by ID
export async function loadArchitecture(
  architectureId: string
): Promise<{ data: SavedArchitecture | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('architectures')
      .select('*')
      .eq('id', architectureId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Delete architecture
export async function deleteArchitecture(
  architectureId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('architectures')
      .delete()
      .eq('id', architectureId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Get collaborators for an architecture
export async function getCollaborators(
  architectureId: string
): Promise<{ data: Collaborator[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('architecture_collaborators')
      .select(`
        *,
        profile:profiles(email, full_name)
      `)
      .eq('architecture_id', architectureId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Add collaborator by email
export async function addCollaborator(
  architectureId: string,
  email: string,
  role: 'Editor' | 'Commenter' | 'Viewer'
): Promise<{ data: Collaborator | null; error: Error | null }> {
  try {
    // First, find the user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found. Make sure they have an account.');
    }

    // Add the collaborator
    const { data, error } = await supabase
      .from('architecture_collaborators')
      .insert({
        architecture_id: architectureId,
        user_id: profile.id,
        role,
      })
      .select(`
        *,
        profile:profiles(email, full_name)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This user is already a collaborator.');
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Remove collaborator
export async function removeCollaborator(
  collaboratorId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('architecture_collaborators')
      .delete()
      .eq('id', collaboratorId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Update collaborator role
export async function updateCollaboratorRole(
  collaboratorId: string,
  role: 'Editor' | 'Commenter' | 'Viewer'
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('architecture_collaborators')
      .update({ role })
      .eq('id', collaboratorId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Toggle public visibility
export async function togglePublicAccess(
  architectureId: string,
  isPublic: boolean
): Promise<{ publicLink: string | null; error: Error | null }> {
  try {
    const publicLink = isPublic ? `public-${architectureId}` : null;
    
    const { error } = await supabase
      .from('architectures')
      .update({
        is_public: isPublic,
        public_link: publicLink,
      })
      .eq('id', architectureId);

    if (error) throw error;
    return { publicLink, error: null };
  } catch (error) {
    return { publicLink: null, error: error as Error };
  }
}
