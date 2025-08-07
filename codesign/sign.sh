#!/bin/zsh

set -euo pipefail
cd "$(dirname "$0")"

SIGNING_IDENTITY="-"
TEAM_ID=""

function sign_item() {
    # phase 1: remove existing signatures and sign with ad-hoc identity
    /usr/bin/codesign -f -s - --deep --force --verbose=4 "$1" || true
    # phase 2: sign with the actual identity so we have no trouble with notarization
    /usr/bin/codesign \
        -f \
        -s $SIGNING_IDENTITY \
        --entitlements photopea.entitlements \
        --requirements "=designated => anchor apple generic and identifier \"\$self.identifier\" and ((cert leaf[field.1.2.840.113635.100.6.1.9] exists) or ( certificate 1[field.1.2.840.113635.100.6.2.6] exists and certificate leaf[field.1.2.840.113635.100.6.1.13] exists and certificate leaf[subject.OU] = \"$TEAM_ID\" ))" \
        --preserve-metadata=identifier,flags \
        --generate-entitlement-der \
        --strip-disallowed-xattrs \
        --options runtime \
        -vvv \
        "$1"
}

find . -name "_CodeSignature" -type d -exec rm -rf {} \; 2>/dev/null || true

while IFS= read -r -d '' ITEM; do
    ITEM_NAME=$(basename "$ITEM")
    SHOULD_PROCESS=false
    
    if [[ "$ITEM" == *".framework" ]]; then
        SHOULD_PROCESS=true
    fi
    
    if [[ -f "$ITEM" && ("$ITEM" == *".dylib" || "$ITEM" == *".so") ]]; then
        SHOULD_PROCESS=true
    fi
    
    if [[ -f "$ITEM" ]]; then
        FILE_TYPE=$(file "$ITEM" 2>/dev/null)
        if [[ "$FILE_TYPE" == *"Mach-O"* ]]; then
            SHOULD_PROCESS=true
        fi
    fi
    
    if [[ $SHOULD_PROCESS == false ]]; then
        continue
    fi

    echo "[*] processing $ITEM"
    sign_item "$ITEM"
done < <(find Products -print0)
