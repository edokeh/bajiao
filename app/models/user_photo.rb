require "digest/sha2"
class UserPhoto < ActiveRecord::Base
  before_save :make_digest

  def make_digest
    self.digest = Digest::SHA2.hexdigest(self.data)
  end
end
