import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RoleForm } from './role-form'
import { RoleFormValue } from '@/resources/queries/roles/role.schema'
import { RoleFormData } from '@/resources/queries/roles/role.type'
import { MemoryRouter } from 'react-router'

// Mock react-router
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock formValuesToRoleData utility
vi.mock('@/resources/queries/roles/role.utils', () => ({
  formValuesToRoleData: vi.fn((data: RoleFormValue) => ({
    name: data.name,
    identifier: data.identifier || '',
    description: data.description || '',
  })),
}))

describe('RoleForm', () => {
  const defaultFormValues: RoleFormValue = {
    name: '',
    identifier: '',
    description: '',
  }

  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure clean DOM before each test
    cleanup()
  })

  const renderRoleForm = (defaultValues: RoleFormValue = defaultFormValues) => {
    return render(
      <MemoryRouter>
        <RoleForm defaultValues={defaultValues} onSubmit={mockOnSubmit} />
      </MemoryRouter>
    )
  }

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      renderRoleForm()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/identifier/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should display "New Role" title when no id is provided', () => {
      renderRoleForm()
      expect(screen.getByText('New Role')).toBeInTheDocument()
    })

    it('should display "Edit Role" title when id is provided', () => {
      renderRoleForm({ ...defaultFormValues, id: '123' })
      expect(screen.getByText('Edit Role')).toBeInTheDocument()
    })

    it('should use custom submit label when provided', () => {
      render(
        <MemoryRouter>
          <RoleForm
            defaultValues={defaultFormValues}
            onSubmit={mockOnSubmit}
            submitLabel="Create Role"
          />
        </MemoryRouter>
      )
      expect(screen.getByRole('button', { name: /create role/i })).toBeInTheDocument()
    })

    it('should populate form fields with default values', () => {
      const values: RoleFormValue = {
        id: '123',
        name: 'Admin Role',
        identifier: 'admin-role',
        description: 'Administrator role',
      }
      renderRoleForm(values)

      expect(screen.getByDisplayValue('Admin Role')).toBeInTheDocument()
      expect(screen.getByDisplayValue('admin-role')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Administrator role')).toBeInTheDocument()
    })
  })

  describe('Identifier Validation Rules', () => {
    describe('Pattern: ^[a-z0-9-_]+$', () => {
      it('should accept valid identifier with lowercase letters', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'valididentifier')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('valididentifier')
        })
      })

      it('should accept valid identifier with numbers', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role123')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('role123')
        })
      })

      it('should accept valid identifier with hyphens', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'admin-role')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('admin-role')
        })
      })

      it('should accept valid identifier with underscores', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'user_role')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('user_role')
        })
      })

      it('should accept valid identifier with mixed valid characters', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role-123_test')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('role-123_test')
        })
      })
    })

    describe('No spaces allowed', () => {
      it('should remove spaces from identifier', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role with spaces')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('rolewithspaces')
        })
      })

      it('should remove leading and trailing spaces', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, '  role  ')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('role')
        })
      })

      it('should remove multiple consecutive spaces', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role    with    spaces')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('rolewithspaces')
        })
      })
    })

    describe('No special characters except hyphens and underscores', () => {
      it('should remove @ symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role@admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove ! symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role!admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove # symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role#admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove $ symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role$admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove % symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role%admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove & symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role&admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove * symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role*admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove . (dot) symbol', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role.admin')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmin')
        })
      })

      it('should remove multiple special characters', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role@admin#test!123')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('roleadmintest123')
        })
      })

      it('should preserve hyphens and underscores while removing other special chars', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'role-admin_test@123')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('role-admin_test123')
        })
      })
    })

    describe('Should be lowercase (or automatically convert to lowercase)', () => {
      it('should convert uppercase letters to lowercase', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'ADMIN-ROLE')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('admin-role')
        })
      })

      it('should convert mixed case letters to lowercase', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'AdminRole')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('adminrole')
        })
      })

      it('should convert uppercase with numbers to lowercase', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'ROLE123')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('role123')
        })
      })

      it('should convert uppercase with hyphens and underscores to lowercase', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'ADMIN-ROLE_TEST')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('admin-role_test')
        })
      })
    })

    describe('Combined validation scenarios', () => {
      it('should handle uppercase, spaces, and special characters together', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'Admin Role@123! Test')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('adminrole123test')
        })
      })

      it('should handle complex invalid input and convert to valid format', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'My-Role@123! Test_Value')

        await waitFor(() => {
          expect(identifierInput).toHaveValue('my-role123test_value')
        })
      })

      it('should allow empty identifier (optional field)', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        expect(identifierInput).toHaveValue('')

        // Type and then clear
        await user.type(identifierInput, 'test')
        await user.clear(identifierInput)

        await waitFor(() => {
          expect(identifierInput).toHaveValue('')
        })
      })

      it('should validate identifier pattern matches schema', async () => {
        const user = userEvent.setup()
        renderRoleForm()

        const identifierInput = screen.getByLabelText(/identifier/i)
        await user.type(identifierInput, 'valid-identifier_123')

        // Should not show validation error
        await waitFor(() => {
          expect(identifierInput).toHaveValue('valid-identifier_123')
        })

        // Try to submit - should not have validation error
        const submitButton = screen.getByRole('button', { name: /save/i })
        await user.click(submitButton)

        // Wait a bit to ensure no validation error appears
        await waitFor(
          () => {
            const errorMessages = screen.queryByText(
              /identifier can only contain lowercase letters, numbers, hyphens, and underscores/i
            )
            expect(errorMessages).not.toBeInTheDocument()
          },
          { timeout: 1000 }
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should preserve existing values when editing', () => {
      const existingValues: RoleFormValue = {
        id: '123',
        name: 'Existing Role',
        identifier: 'existing-role',
        description: 'Existing description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      renderRoleForm(existingValues)

      expect(screen.getByDisplayValue('Existing Role')).toBeInTheDocument()
      expect(screen.getByDisplayValue('existing-role')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
    })
  })
})
