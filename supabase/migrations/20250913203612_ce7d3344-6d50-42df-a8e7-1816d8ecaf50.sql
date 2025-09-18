-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE task_status AS ENUM ('backlog', 'ready', 'in_progress', 'done');
CREATE TYPE task_type AS ENUM ('email', 'doc', 'code', 'research');
CREATE TYPE mount_type AS ENUM ('local', 'repo', 'upload');

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization memberships
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tools table (marketplace)
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    price DECIMAL(10,2),
    categories TEXT[] DEFAULT '{}',
    has_deal BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project tools (assigned tools)
CREATE TABLE project_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, tool_id)
);

-- Tasks table (Kanban board)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    status task_status NOT NULL DEFAULT 'backlog',
    type task_type NOT NULL DEFAULT 'doc',
    assigned_tool_id UUID REFERENCES tools(id),
    token_estimate INTEGER DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document mounts
CREATE TABLE doc_mounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    mount_type mount_type NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document update audit
CREATE TABLE docs_update_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_mount_id UUID REFERENCES doc_mounts(id) ON DELETE CASCADE NOT NULL,
    diff_content TEXT,
    applied_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys (encrypted storage)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage events
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES tools(id),
    tokens_used INTEGER DEFAULT 0,
    event_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_mounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_update_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Members can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Members can update their organizations" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Memberships policies
CREATE POLICY "Members can view org memberships" ON memberships
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM memberships m2 
            WHERE m2.organization_id = memberships.organization_id 
            AND m2.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners/admins can manage memberships" ON memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memberships m2 
            WHERE m2.organization_id = memberships.organization_id 
            AND m2.user_id = auth.uid() 
            AND m2.role IN ('owner', 'admin')
        )
    );

-- Projects policies
CREATE POLICY "Org members can view projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE organization_id = projects.organization_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can create projects" ON projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE organization_id = projects.organization_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can update projects" ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships 
            WHERE organization_id = projects.organization_id 
            AND user_id = auth.uid()
        )
    );

-- Tools are public (marketplace)
CREATE POLICY "Anyone can view tools" ON tools FOR SELECT USING (true);

-- Project tools policies
CREATE POLICY "Project members can view project tools" ON project_tools
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = project_tools.project_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage project tools" ON project_tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = project_tools.project_id 
            AND m.user_id = auth.uid()
        )
    );

-- Tasks policies
CREATE POLICY "Project members can manage tasks" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = tasks.project_id 
            AND m.user_id = auth.uid()
        )
    );

-- Doc mounts policies
CREATE POLICY "Project members can manage doc mounts" ON doc_mounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = doc_mounts.project_id 
            AND m.user_id = auth.uid()
        )
    );

-- Docs audit policies
CREATE POLICY "Project members can view docs audit" ON docs_update_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doc_mounts dm
            JOIN projects p ON dm.project_id = p.id
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE dm.id = docs_update_audit.doc_mount_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create docs audit" ON docs_update_audit
    FOR INSERT WITH CHECK (
        auth.uid() = applied_by AND
        EXISTS (
            SELECT 1 FROM doc_mounts dm
            JOIN projects p ON dm.project_id = p.id
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE dm.id = docs_update_audit.doc_mount_id 
            AND m.user_id = auth.uid()
        )
    );

-- API keys policies
CREATE POLICY "Project members can manage api keys" ON api_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = api_keys.project_id 
            AND m.user_id = auth.uid()
        )
    );

-- Usage events policies
CREATE POLICY "Project members can view usage events" ON usage_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = usage_events.project_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create usage events" ON usage_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN memberships m ON p.organization_id = m.organization_id
            WHERE p.id = usage_events.project_id 
            AND m.user_id = auth.uid()
        )
    );

-- Create trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO tools (name, description, logo_url, price, categories, has_deal, is_featured) VALUES
('OpenAI GPT-4', 'Advanced language model for text generation and analysis', null, 20.00, ARRAY['LLM', 'AI'], true, true),
('Anthropic Claude', 'Constitutional AI assistant for safe and helpful responses', null, 18.00, ARRAY['LLM', 'AI'], false, true),
('GitHub Integration', 'Connect repositories for automatic documentation updates', null, 0.00, ARRAY['Git', 'Integration'], false, false),
('Gmail Connector', 'Sync emails and create tasks from important messages', null, 5.00, ARRAY['Email', 'Integration'], true, false),
('Pinecone Vector DB', 'High-performance vector database for semantic search', null, 25.00, ARRAY['Vector DB', 'Storage'], false, false),
('Notion API', 'Sync documents and databases with Notion workspace', null, 10.00, ARRAY['Docs', 'Integration'], false, false);